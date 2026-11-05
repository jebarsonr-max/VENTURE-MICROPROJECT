import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(30), default="student", nullable=False)  # student, vendor, admin
    phone = Column(String(30), nullable=True)
    campus_id = Column(String(50), nullable=True)  # Student/Staff ID
    hostel_block = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    orders = relationship("Order", back_populates="student", cascade="all, delete-orphan")
    vendor_profile = relationship("Vendor", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    store_name = Column(String(150), nullable=False)
    category = Column(String(100), default="Food & Beverages")
    building_location = Column(String(150), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    rating = Column(Float, default=4.8)
    banner_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="vendor_profile")
    products = relationship("Product", back_populates="vendor", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="vendor")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    icon = Column(String(50), default="Package")

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=50)
    image_url = Column(String(500), nullable=True)
    weight_kg = Column(Float, default=0.5)  # Crucial for logistics payload validation
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    vendor = relationship("Vendor", back_populates="products")
    category = relationship("Category", back_populates="products")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_code = Column(String(50), unique=True, index=True, nullable=False)
    vehicle_type = Column(String(20), nullable=False)  # "robot" or "drone"
    model_name = Column(String(100), nullable=False)
    battery_percentage = Column(Float, default=100.0)
    current_lat = Column(Float, nullable=False)
    current_lng = Column(Float, nullable=False)
    speed_kmh = Column(Float, default=0.0)
    max_payload_kg = Column(Float, default=15.0)
    # status: idle, en_route_pickup, delivering, returning, charging, maintenance
    status = Column(String(30), default="idle")
    is_active = Column(Boolean, default=True)
    total_deliveries = Column(Integer, default=0)
    total_distance_km = Column(Float, default=0.0)
    
    # Telemetry snapshot for IoT monitor (JSON)
    # e.g. {"temp_c": 31.4, "network_signal_dbm": -68, "motor_health": 99.2, "heading_deg": 145}
    telemetry_data = Column(JSON, nullable=True)
    last_ping = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    assignments = relationship("DeliveryAssignment", back_populates="vehicle")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    # status: pending, vendor_accepted, preparing, ready_for_pickup, assigned, in_transit, delivered, cancelled
    status = Column(String(30), default="pending")
    # priority: normal, high, urgent
    priority = Column(String(20), default="normal")
    total_amount = Column(Float, default=0.0)
    delivery_fee = Column(Float, default=15.0)
    total_weight_kg = Column(Float, default=0.5)
    
    delivery_location_name = Column(String(150), nullable=False)
    delivery_lat = Column(Float, nullable=False)
    delivery_lng = Column(Float, nullable=False)
    delivery_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    student = relationship("User", back_populates="orders")
    vendor = relationship("Vendor", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    assignment = relationship("DeliveryAssignment", back_populates="order", uselist=False, cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_name = Column(String(150), nullable=False)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    subtotal = Column(Float, nullable=False)
    unit_weight_kg = Column(Float, default=0.5)

    order = relationship("Order", back_populates="items")


class DeliveryAssignment(Base):
    __tablename__ = "delivery_assignments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), unique=True, nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    pickup_location_name = Column(String(150), nullable=False)
    pickup_lat = Column(Float, nullable=False)
    pickup_lng = Column(Float, nullable=False)
    
    destination_location_name = Column(String(150), nullable=False)
    destination_lat = Column(Float, nullable=False)
    destination_lng = Column(Float, nullable=False)
    
    estimated_distance_km = Column(Float, default=1.0)
    estimated_duration_mins = Column(Float, default=5.0)
    actual_duration_mins = Column(Float, nullable=True)
    
    # Precomputed path waypoints [[lat, lng], [lat, lng]...]
    route_waypoints = Column(JSON, nullable=True)
    # Algorithmic justification
    assignment_reason = Column(Text, nullable=True)
    routing_algorithm = Column(String(50), default="Dijkstra Shortest Path")
    
    # status: assigned, moving_to_vendor, picking_up, in_transit, arrived, completed, failed
    status = Column(String(30), default="assigned")
    current_step_index = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)

    order = relationship("Order", back_populates="assignment")
    vehicle = relationship("Vehicle", back_populates="assignments")
    tracking_points = relationship("TrackingHistory", back_populates="assignment", cascade="all, delete-orphan")


class TrackingHistory(Base):
    __tablename__ = "tracking_history"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("delivery_assignments.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    battery_percentage = Column(Float, nullable=False)
    speed_kmh = Column(Float, default=0.0)
    event_note = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    assignment = relationship("DeliveryAssignment", back_populates="tracking_points")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(30), default="order")  # order, vehicle, system
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

