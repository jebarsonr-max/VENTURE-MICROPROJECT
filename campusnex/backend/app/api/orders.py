import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.models import Order, OrderItem, Product, Vendor, User, DeliveryAssignment, Vehicle, Notification
from app.schemas.schemas import OrderCreate, OrderOut, OrderStatusUpdate
from app.core.security import get_current_user, require_role
from app.algorithms.dispatch_engine import dispatch_best_vehicle
from app.services.simulation import simulator

router = APIRouter(prefix="/orders", tags=["Orders & Delivery Lifecycle"])

@router.post("", response_model=OrderOut)
def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item.")

    vendor = db.query(Vendor).filter(Vendor.id == order_in.vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found.")

    # Calculate totals & weights
    total_amount = 0.0
    total_weight = 0.0
    order_items_to_create = []

    for item_in in order_in.items:
        product = db.query(Product).filter(Product.id == item_in.product_id).first()
        if not product or not product.is_available:
            raise HTTPException(status_code=400, detail=f"Product ID {item_in.product_id} is unavailable.")
        if product.stock < item_in.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}.")

        subtotal = round(product.price * item_in.quantity, 2)
        total_amount += subtotal
        total_weight += (product.weight_kg * item_in.quantity)

        # Decrement stock
        product.stock -= item_in.quantity

        order_items_to_create.append({
            "product_id": product.id,
            "product_name": product.name,
            "unit_price": product.price,
            "quantity": item_in.quantity,
            "subtotal": subtotal,
            "unit_weight_kg": product.weight_kg
        })

    order_num = f"CNX-{datetime.datetime.utcnow().strftime('%y%m%d')}-{uuid.uuid4().hex[:5].upper()}"

    new_order = Order(
        order_number=order_num,
        student_id=current_user.id,
        vendor_id=vendor.id,
        status="pending",
        priority=order_in.priority,
        total_amount=round(total_amount, 2),
        delivery_fee=15.0 if order_in.priority == "normal" else (25.0 if order_in.priority == "high" else 40.0),
        total_weight_kg=round(total_weight, 2),
        delivery_location_name=order_in.delivery_location_name,
        delivery_lat=order_in.delivery_lat,
        delivery_lng=order_in.delivery_lng,
        delivery_notes=order_in.delivery_notes
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Insert order items
    for item_data in order_items_to_create:
        item_obj = OrderItem(order_id=new_order.id, **item_data)
        db.add(item_obj)

    # Create notification for student
    notif = Notification(
        user_id=current_user.id,
        title="Order Placed Successfully",
        message=f"Order #{new_order.order_number} submitted to {vendor.store_name}. Awaiting vendor acceptance.",
        type="order"
    )
    db.add(notif)
    db.commit()
    db.refresh(new_order)

    return new_order

@router.get("", response_model=List[OrderOut])
def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "admin":
        return db.query(Order).order_by(Order.created_at.desc()).all()
    return db.query(Order).filter(Order.student_id == current_user.id).order_by(Order.created_at.desc()).all()

@router.get("/vendor", response_model=List[OrderOut])
def get_vendor_orders(
    current_user: User = Depends(require_role(["vendor", "admin"])),
    db: Session = Depends(get_db)
):
    vendor = current_user.vendor_profile
    if not vendor and current_user.role != "admin":
        return []
    if current_user.role == "admin":
        return db.query(Order).order_by(Order.created_at.desc()).all()
    return db.query(Order).filter(Order.vendor_id == vendor.id).order_by(Order.created_at.desc()).all()

@router.get("/{order_id}", response_model=OrderOut)
def get_order_by_id(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Permissions check
    if current_user.role == "student" and order.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order.")
    if current_user.role == "vendor" and order.vendor_id != current_user.vendor_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to view another vendor's order.")

    return order

@router.post("/{order_id}/vendor-status", response_model=OrderOut)
def update_vendor_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    current_user: User = Depends(require_role(["vendor", "admin"])),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    valid_statuses = ["vendor_accepted", "preparing", "ready_for_pickup", "cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {valid_statuses}")

    order.status = status_update.status
    order.updated_at = datetime.datetime.utcnow()

    # If vendor marked ready, trigger autonomous dispatch automatically!
    if status_update.status == "ready_for_pickup" and not order.assignment:
        vehicle, route_info, reason = dispatch_best_vehicle(order, db)
        if vehicle and route_info:
            vehicle.status = "en_route_pickup"
            assignment = DeliveryAssignment(
                order_id=order.id,
                vehicle_id=vehicle.id,
                pickup_location_name=order.vendor.building_location,
                pickup_lat=order.vendor.lat,
                pickup_lng=order.vendor.lng,
                destination_location_name=order.delivery_location_name,
                destination_lat=order.delivery_lat,
                destination_lng=order.delivery_lng,
                estimated_distance_km=route_info["total_distance_km"],
                estimated_duration_mins=round((route_info["total_distance_km"] / (45.0 if vehicle.vehicle_type == "drone" else 15.0)) * 60 + 1.5, 1),
                route_waypoints=route_info["dense_waypoints"],
                assignment_reason=reason,
                routing_algorithm=route_info["algorithm"],
                status="moving_to_vendor"
            )
            db.add(assignment)
            order.status = "assigned"

            notif = Notification(
                user_id=order.student_id,
                title="Autonomous Vehicle Dispatched! 🚀",
                message=f"{vehicle.vehicle_code} has been assigned and is heading to the vendor.",
                type="vehicle"
            )
            db.add(notif)

    db.commit()
    db.refresh(order)
    return order

@router.post("/{order_id}/dispatch", response_model=OrderOut)
def manual_dispatch_order(
    order_id: int,
    current_user: User = Depends(require_role(["admin", "vendor"])),
    db: Session = Depends(get_db)
):
    """Force or manually trigger vehicle dispatch for an order."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.assignment and order.assignment.status in ["moving_to_vendor", "picking_up", "in_transit"]:
        raise HTTPException(status_code=400, detail="Order is already actively assigned to a vehicle.")

    vehicle, route_info, reason = dispatch_best_vehicle(order, db)
    if not vehicle or not route_info:
        raise HTTPException(status_code=400, detail=f"Dispatch failed: {reason}")

    # Remove previous assignment if any
    if order.assignment:
        db.delete(order.assignment)
        db.flush()

    vehicle.status = "en_route_pickup"
    assignment = DeliveryAssignment(
        order_id=order.id,
        vehicle_id=vehicle.id,
        pickup_location_name=order.vendor.building_location,
        pickup_lat=order.vendor.lat,
        pickup_lng=order.vendor.lng,
        destination_location_name=order.delivery_location_name,
        destination_lat=order.delivery_lat,
        destination_lng=order.delivery_lng,
        estimated_distance_km=route_info["total_distance_km"],
        estimated_duration_mins=round((route_info["total_distance_km"] / (45.0 if vehicle.vehicle_type == "drone" else 15.0)) * 60 + 1.5, 1),
        route_waypoints=route_info["dense_waypoints"],
        assignment_reason=reason,
        routing_algorithm=route_info["algorithm"],
        status="moving_to_vendor"
    )
    db.add(assignment)
    order.status = "assigned"
    db.commit()
    db.refresh(order)
    return order

@router.post("/{order_id}/advance_simulation", response_model=OrderOut)
def advance_delivery_step(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Advances simulated vehicle delivery by one waypoint step for live demonstration."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if not order.assignment:
        raise HTTPException(status_code=400, detail="Order has no active delivery assignment.")

    simulator.advance_assignment_step(order.assignment, db)
    db.refresh(order)
    return order

@router.post("/{order_id}/confirm_delivery", response_model=OrderOut)
def confirm_order_delivered(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Student confirms package arrival at doorstep / locker."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = "delivered"
    order.updated_at = datetime.datetime.utcnow()
    if order.assignment:
        order.assignment.status = "completed"
        order.assignment.completed_at = datetime.datetime.utcnow()
        if order.assignment.vehicle:
            order.assignment.vehicle.status = "idle"
            order.assignment.vehicle.total_deliveries += 1

    notif = Notification(
        user_id=order.student_id,
        title="Delivery Confirmed",
        message=f"Order #{order.order_number} confirmed delivered. Thank you for choosing zero-emission campus delivery!",
        type="order"
    )
    db.add(notif)
    db.commit()
    db.refresh(order)
    return order

@router.post("/{order_id}/cancel", response_model=OrderOut)
def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status in ["in_transit", "delivered"]:
        raise HTTPException(status_code=400, detail="Cannot cancel an order currently in transit or delivered.")

    order.status = "cancelled"
    if order.assignment:
        order.assignment.status = "failed"
        if order.assignment.vehicle:
            order.assignment.vehicle.status = "idle"

    # Restock products
    for item in order.items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if prod:
            prod.stock += item.quantity

    db.commit()
    db.refresh(order)
    return order

