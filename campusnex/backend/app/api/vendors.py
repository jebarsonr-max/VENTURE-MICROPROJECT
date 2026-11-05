from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.models.models import Vendor, Order, Product, User
from app.schemas.schemas import VendorOut
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/vendors", tags=["Vendors"])

@router.get("", response_model=List[VendorOut])
def get_vendors(db: Session = Depends(get_db)):
    return db.query(Vendor).filter(Vendor.is_active == True).all()

@router.get("/metrics")
def get_vendor_dashboard_metrics(
    current_user: User = Depends(require_role(["vendor", "admin"])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    vendor = current_user.vendor_profile
    if not vendor and current_user.role != "admin":
        raise HTTPException(status_code=400, detail="Vendor profile required.")
    
    vendor_id = vendor.id if vendor else None
    query = db.query(Order)
    if vendor_id:
        query = query.filter(Order.vendor_id == vendor_id)
        
    orders = query.all()
    total_revenue = sum(o.total_amount for o in orders if o.status == "delivered")
    pending = len([o for o in orders if o.status in ["pending", "vendor_accepted", "preparing"]])
    in_transit = len([o for o in orders if o.status in ["ready_for_pickup", "assigned", "in_transit"]])
    completed = len([o for o in orders if o.status == "delivered"])
    
    products_count = db.query(Product).filter(Product.vendor_id == vendor_id).count() if vendor_id else db.query(Product).count()

    return {
        "store_name": vendor.store_name if vendor else "Global Operations",
        "total_revenue": round(total_revenue, 2),
        "pending_orders": pending,
        "in_transit_orders": in_transit,
        "completed_orders": completed,
        "total_products": products_count,
        "rating": vendor.rating if vendor else 4.9
    }

