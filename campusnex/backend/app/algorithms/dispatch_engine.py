from typing import Tuple, Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import Order, Vehicle, DeliveryAssignment
from app.algorithms.campus_graph import campus_graph, haversine_distance
from app.core.config import settings

def dispatch_best_vehicle(order: Order, db: Session) -> Tuple[Optional[Vehicle], Optional[Dict[str, Any]], str]:
    """
    Intelligent Dispatch Algorithm for Campus Delivery Fleet.
    Evaluates all active vehicles against payload, battery reserves, ETA, and priority.
    Returns (selected_vehicle, routing_result, assignment_reason).
    """
    # 1. Fetch available active vehicles
    candidates = db.query(Vehicle).filter(
        Vehicle.is_active == True,
        Vehicle.status.in_(["idle", "returning"])
    ).all()

    if not candidates:
        return None, None, "No active vehicles currently idle or available in fleet."

    vendor = order.vendor
    pickup_lat, pickup_lng = vendor.lat, vendor.lng
    dest_lat, dest_lng = order.delivery_lat, order.delivery_lng
    order_weight = order.total_weight_kg

    # Nearest nodes for routing
    pickup_node = campus_graph.find_nearest_node(pickup_lat, pickup_lng)
    dest_node = campus_graph.find_nearest_node(dest_lat, dest_lng)

    scored_vehicles: List[Dict[str, Any]] = []

    for vehicle in candidates:
        # Constraint A: Payload capacity check
        if vehicle.max_payload_kg < order_weight:
            continue

        # Constraint B: Drone vs Ground suitability
        if vehicle.vehicle_type == "drone" and order_weight > settings.DRONE_MAX_PAYLOAD_KG:
            continue

        # Calculate distances
        dist_to_pickup = haversine_distance(vehicle.current_lat, vehicle.current_lng, pickup_lat, pickup_lng)
        
        if vehicle.vehicle_type == "drone":
            route_info = campus_graph.drone_aerial_corridor(pickup_node, dest_node)
            delivery_dist = route_info["total_distance_km"]
            speed = settings.DRONE_SPEED_KMH
            battery_burn_rate_per_km = 1.8  # ~1.8% battery per km
        else:
            route_info = campus_graph.dijkstra_shortest_path(pickup_node, dest_node)
            delivery_dist = route_info["total_distance_km"]
            speed = settings.ROBOT_SPEED_KMH
            battery_burn_rate_per_km = 0.8  # ~0.8% battery per km

        total_trip_km = dist_to_pickup + delivery_dist
        est_battery_needed = (total_trip_km * battery_burn_rate_per_km) + 15.0  # 15% safety reserve

        # Constraint C: Battery sufficiency
        if vehicle.battery_percentage < max(settings.MIN_BATTERY_FOR_DISPATCH, est_battery_needed):
            continue

        # Calculate ETA
        travel_hours = total_trip_km / max(speed, 1.0)
        eta_mins = (travel_hours * 60.0) + 1.5  # 1.5 mins loading buffer

        # Scoring: lower score is better
        # For urgent orders, time is weighted heavily (multiplier x2.5)
        # Drones get preference for urgent orders if lightweight
        score = eta_mins
        if order.priority == "urgent" and vehicle.vehicle_type == "drone":
            score *= 0.6  # Drone priority boost
        elif order.priority == "normal" and vehicle.vehicle_type == "robot":
            score *= 0.85 # Ground robot energy efficiency preference

        scored_vehicles.append({
            "vehicle": vehicle,
            "route_info": route_info,
            "total_distance_km": round(total_trip_km, 3),
            "eta_mins": round(eta_mins, 1),
            "score": score,
            "battery_margin": round(vehicle.battery_percentage - est_battery_needed, 1)
        })

    if not scored_vehicles:
        return None, None, f"Vehicles checked ({len(candidates)} candidates), but none passed payload ({order_weight}kg) or battery requirements."

    # Sort by best score (lowest ETA / weighted cost)
    scored_vehicles.sort(key=lambda x: x["score"])
    chosen = scored_vehicles[0]
    chosen_vehicle: Vehicle = chosen["vehicle"]
    route_info = chosen["route_info"]

    v_type_label = "Autonomous Quadcopter Drone" if chosen_vehicle.vehicle_type == "drone" else "Autonomous Ground Robot (UGV)"
    reason = (
        f"Selected {chosen_vehicle.vehicle_code} ({v_type_label}). "
        f"Order weight: {order_weight:.2f}kg (Capacity: {chosen_vehicle.max_payload_kg}kg). "
        f"Battery: {chosen_vehicle.battery_percentage:.1f}% (Margin: +{chosen['battery_margin']}%). "
        f"Total estimated trip: {chosen['total_distance_km']}km. ETA: ~{chosen['eta_mins']} mins. "
        f"Priority logic: {order.priority.capitalize()} delivery mode optimal matching."
    )

    return chosen_vehicle, route_info, reason

