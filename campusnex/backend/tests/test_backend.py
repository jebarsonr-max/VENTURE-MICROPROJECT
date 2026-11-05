import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.session import SessionLocal, engine, Base
from app.database.seed import seed_database
from app.algorithms.campus_graph import campus_graph
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.schemas import RouteCalculationRequest
from app.api.auth import get_demo_accounts
from app.api.products import get_categories, get_products
from app.api.logistics import calculate_route
from app.api.iot import get_live_iot_telemetry
from app.api.sustainability import get_sustainability_metrics
from app.algorithms.dispatch_engine import dispatch_best_vehicle
from app.models.models import Order, Vehicle, User

def test_security_hashing():
    raw = "testPassword123"
    hashed = hash_password(raw)
    assert verify_password(raw, hashed) is True
    assert verify_password("wrong", hashed) is False

def test_jwt_generation():
    token = create_access_token(subject=1, role="student")
    assert isinstance(token, str)
    assert len(token) > 20

def test_database_and_demo_seed():
    seed_database()
    db = SessionLocal()
    users = db.query(User).all()
    assert len(users) >= 3
    vehicles = db.query(Vehicle).all()
    assert len(vehicles) >= 5
    db.close()

def test_demo_accounts_content():
    accounts = get_demo_accounts()
    assert len(accounts) == 3
    roles = [a["role"] for a in accounts]
    assert "student" in roles
    assert "vendor" in roles
    assert "admin" in roles

def test_catalog_query():
    db = SessionLocal()
    cats = get_categories(db=db)
    assert len(cats) >= 4
    prods = get_products(db=db)
    assert len(prods) >= 8
    db.close()

def test_dijkstra_and_astar_routing():
    # Dijkstra
    req_dijkstra = RouteCalculationRequest(
        start_node="food_court",
        end_node="hostel_alpha",
        vehicle_type="robot",
        algorithm="dijkstra"
    )
    res_d = calculate_route(req_dijkstra)
    assert res_d["total_distance_km"] > 0
    assert len(res_d["waypoints"]) >= 2
    assert "Dijkstra" in res_d["algorithm"]

    # A*
    req_astar = RouteCalculationRequest(
        start_node="food_court",
        end_node="hostel_alpha",
        vehicle_type="robot",
        algorithm="astar"
    )
    res_a = calculate_route(req_astar)
    assert res_a["total_distance_km"] > 0
    assert "A*" in res_a["algorithm"]

    # Drone corridor
    req_drone = RouteCalculationRequest(
        start_node="food_court",
        end_node="hostel_alpha",
        vehicle_type="drone",
        algorithm="corridor"
    )
    res_drone = calculate_route(req_drone)
    assert res_drone["vehicle_type"] == "drone"

def test_dispatch_engine_decision():
    db = SessionLocal()
    order = db.query(Order).first()
    if not order:
        # Create lightweight dummy order
        order = Order(
            order_number="TEST-001",
            student_id=1,
            vendor_id=1,
            status="pending",
            priority="urgent",
            total_amount=250.0,
            delivery_fee=25.0,
            total_weight_kg=0.8,
            delivery_location_name="Hostel Alpha (North Wing)",
            delivery_lat=12.97450,
            delivery_lng=77.59250
        )
        db.add(order)
        db.commit()
        db.refresh(order)

    vehicle, route_info, reason = dispatch_best_vehicle(order, db)
    assert vehicle is not None
    assert route_info is not None
    assert len(reason) > 10
    db.close()

def test_iot_telemetry():
    db = SessionLocal()
    feed = get_live_iot_telemetry(db=db)
    assert feed["status"] == "ONLINE"
    assert feed["total_active_nodes"] >= 5
    db.close()

def test_sustainability():
    db = SessionLocal()
    metrics = get_sustainability_metrics(db=db)
    assert metrics["total_deliveries_completed"] > 0
    assert metrics["estimated_co2_avoided_kg"] > 0
    assert metrics["petrol_litres_saved"] > 0
    db.close()
