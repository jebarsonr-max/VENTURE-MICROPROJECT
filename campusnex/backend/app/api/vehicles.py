from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.models import Vehicle, User
from app.schemas.schemas import VehicleOut, VehicleStatusUpdate
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/vehicles", tags=["Fleet & Vehicles"])

@router.get("", response_model=List[VehicleOut])
def get_fleet_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).all()

@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v

@router.patch("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle_status(
    vehicle_id: int,
    update_in: VehicleStatusUpdate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if update_in.status is not None:
        v.status = update_in.status
    if update_in.battery_percentage is not None:
        v.battery_percentage = update_in.battery_percentage
    if update_in.is_active is not None:
        v.is_active = update_in.is_active

    db.commit()
    db.refresh(v)
    return v

@router.post("/{vehicle_id}/recharge", response_model=VehicleOut)
def recharge_vehicle(
    vehicle_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Instantly recharges vehicle battery to 100% for rapid operational testing."""
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    v.battery_percentage = 100.0
    v.status = "idle"
    db.commit()
    db.refresh(v)
    return v

