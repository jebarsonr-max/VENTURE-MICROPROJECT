from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, Vendor
from app.schemas.schemas import UserCreate, UserLogin, UserOut, Token
from app.core.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        role=user_in.role,
        phone=user_in.phone,
        campus_id=user_in.campus_id,
        hostel_block=user_in.hostel_block
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # If role is vendor, create a default vendor store profile
    if new_user.role == "vendor":
        vendor_prof = Vendor(
            user_id=new_user.id,
            store_name=f"{new_user.name}'s Campus Store",
            category="General Campus Needs",
            building_location="Central Food Court & Cafeteria",
            lat=12.97120,
            lng=77.59400
        )
        db.add(vendor_prof)
        db.commit()

    token = create_access_token(subject=new_user.id, role=new_user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
def login_json(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is deactivated.")

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/token", response_model=Token)
def login_oauth2(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")
    
    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/demo-accounts")
def get_demo_accounts():
    """Returns the preconfigured demo login credentials for evaluators."""
    return [
        {
            "role": "student",
            "name": "Alex Chen (Student)",
            "email": "student@campusnex.edu",
            "password": "password123",
            "description": "Student account to order campus food, stationery, books, and track deliveries."
        },
        {
            "role": "vendor",
            "name": "Cafeteria Express (Vendor)",
            "email": "vendor@campusnex.edu",
            "password": "password123",
            "description": "Campus food vendor managing incoming orders, preparation, and inventory."
        },
        {
            "role": "admin",
            "name": "Logistics Dispatch Ops (Admin)",
            "email": "admin@campusnex.edu",
            "password": "password123",
            "description": "Network administrator managing fleet robots, drones, telemetry, and system KPIs."
        }
    ]

