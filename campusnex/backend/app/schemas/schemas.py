from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# Auth & User
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "student"
    phone: Optional[str] = None
    campus_id: Optional[str] = None
    hostel_block: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# Vendor
class VendorBase(BaseModel):
    store_name: str
    category: str
    building_location: str
    lat: float
    lng: float
    rating: float = 4.8
    banner_url: Optional[str] = None

class VendorCreate(VendorBase):
    pass

class VendorOut(VendorBase):
    id: int
    user_id: int
    is_active: bool

    class Config:
        from_attributes = True

# Category & Product
class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 50
    image_url: Optional[str] = None
    weight_kg: float = 0.5
    is_available: bool = True
    category_id: int

class ProductCreate(ProductBase):
    vendor_id: Optional[int] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    weight_kg: Optional[float] = None
    is_available: Optional[bool] = None
    category_id: Optional[int] = None

class ProductOut(ProductBase):
    id: int
    vendor_id: int
    created_at: datetime
    category: Optional[CategoryOut] = None

    class Config:
        from_attributes = True

# Order Items & Orders
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class OrderItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    unit_price: float
    quantity: int
    subtotal: float
    unit_weight_kg: float

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    vendor_id: int
    items: List[OrderItemCreate]
    delivery_location_name: str
    delivery_lat: float
    delivery_lng: float
    delivery_notes: Optional[str] = None
    priority: str = "normal"  # normal, high, urgent

class OrderStatusUpdate(BaseModel):
    status: str

# Vehicle & Delivery
class VehicleBase(BaseModel):
    vehicle_code: str
    vehicle_type: str
    model_name: str
    battery_percentage: float
    current_lat: float
    current_lng: float
    speed_kmh: float
    max_payload_kg: float
    status: str
    is_active: bool
    total_deliveries: int
    total_distance_km: float

class VehicleOut(VehicleBase):
    id: int
    telemetry_data: Optional[Dict[str, Any]] = None
    last_ping: Optional[datetime] = None

    class Config:
        from_attributes = True

class VehicleStatusUpdate(BaseModel):
    status: Optional[str] = None
    battery_percentage: Optional[float] = None
    is_active: Optional[bool] = None

class DeliveryAssignmentOut(BaseModel):
    id: int
    order_id: int
    vehicle_id: int
    assigned_at: datetime
    pickup_location_name: str
    pickup_lat: float
    pickup_lng: float
    destination_location_name: str
    destination_lat: float
    destination_lng: float
    estimated_distance_km: float
    estimated_duration_mins: float
    actual_duration_mins: Optional[float] = None
    route_waypoints: Optional[List[List[float]]] = None
    assignment_reason: Optional[str] = None
    routing_algorithm: Optional[str] = None
    status: str
    current_step_index: int
    completed_at: Optional[datetime] = None
    vehicle: Optional[VehicleOut] = None

    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    order_number: str
    student_id: int
    vendor_id: int
    status: str
    priority: str
    total_amount: float
    delivery_fee: float
    total_weight_kg: float
    delivery_location_name: str
    delivery_lat: float
    delivery_lng: float
    delivery_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemOut] = []
    assignment: Optional[DeliveryAssignmentOut] = None
    vendor: Optional[VendorOut] = None
    student: Optional[UserOut] = None

    class Config:
        from_attributes = True

# Notification
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Algorithm & Logistics Demonstration Schemas
class RouteCalculationRequest(BaseModel):
    start_node: str
    end_node: str
    vehicle_type: str = "robot"  # "robot" or "drone"
    algorithm: str = "dijkstra"  # "dijkstra" or "astar"

class RouteCalculationResponse(BaseModel):
    start_node: str
    end_node: str
    vehicle_type: str
    algorithm: str
    total_distance_km: float
    estimated_duration_mins: float
    path_nodes: List[str]
    waypoints: List[List[float]]
    steps_log: List[Dict[str, Any]]
    explanation: str

# Sustainability
class SustainabilityMetrics(BaseModel):
    total_deliveries_completed: int
    total_distance_travelled_km: float
    estimated_co2_avoided_kg: float
    petrol_litres_saved: float
    clean_kwh_consumed: float
    robot_delivery_pct: float
    drone_delivery_pct: float
    avg_delivery_time_mins: float
    calculation_basis: str

