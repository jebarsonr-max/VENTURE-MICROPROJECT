import datetime
from sqlalchemy.orm import Session
from app.database.session import SessionLocal, Base, engine
from app.models.models import User, Vendor, Category, Product, Vehicle, Order, OrderItem, DeliveryAssignment, TrackingHistory, Notification
from app.core.security import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if already seeded
    if db.query(User).filter(User.email == "student@campusnex.edu").first():
        # Update product images to local verified assets if they are still external
        update_local_product_images(db)
        db.close()
        return

    print("Seeding CAMPUSNEX database with realistic demonstration data...")

    # 1. Categories
    categories_data = [
        {"name": "Food & Beverages", "slug": "food-beverages", "description": "Fresh meals, snacks, gourmet coffees, and hydration", "icon": "Utensils"},
        {"name": "Stationery & Supplies", "slug": "stationery", "description": "Drafting tools, notebooks, pens, and printing materials", "icon": "PenTool"},
        {"name": "Academic Books", "slug": "books", "description": "Curriculum textbooks, references, and research manuals", "icon": "BookOpen"},
        {"name": "Laboratory Essentials", "slug": "lab-essentials", "description": "Sterile labware, chemicals, safety gear, and testing reagents", "icon": "FlaskConical"},
        {"name": "General Campus Needs", "slug": "campus-needs", "description": "Chargers, dorm supplies, umbrellas, and hygiene kits", "icon": "ShoppingBag"}
    ]
    created_cats = {}
    for c in categories_data:
        cat = Category(**c)
        db.add(cat)
        db.flush()
        created_cats[cat.slug] = cat

    # 2. Users
    pw_hash = hash_password("password123")
    
    student_user = User(
        name="Alex Chen",
        email="student@campusnex.edu",
        hashed_password=pw_hash,
        role="student",
        phone="+91 98765 43210",
        campus_id="STU-2026-8812",
        hostel_block="Hostel Alpha (North Wing)"
    )
    db.add(student_user)

    vendor_user_1 = User(
        name="Chef Marco",
        email="vendor@campusnex.edu",
        hashed_password=pw_hash,
        role="vendor",
        phone="+91 98765 43211",
        campus_id="VEN-2026-001"
    )
    db.add(vendor_user_1)

    vendor_user_2 = User(
        name="Campus Stationery Ops",
        email="stationery@campusnex.edu",
        hashed_password=pw_hash,
        role="vendor",
        phone="+91 98765 43212",
        campus_id="VEN-2026-002"
    )
    db.add(vendor_user_2)

    vendor_user_3 = User(
        name="BioMaterials Facility",
        email="biolab@campusnex.edu",
        hashed_password=pw_hash,
        role="vendor",
        phone="+91 98765 43213",
        campus_id="VEN-2026-003"
    )
    db.add(vendor_user_3)

    admin_user = User(
        name="Campus Dispatch Operations",
        email="admin@campusnex.edu",
        hashed_password=pw_hash,
        role="admin",
        phone="+91 98765 43299",
        campus_id="ADM-DISPATCH-01"
    )
    db.add(admin_user)
    db.flush()

    # 3. Vendors with Local Banner Images
    vendor_1 = Vendor(
        user_id=vendor_user_1.id,
        store_name="Cafeteria Express & Deli",
        category="Food & Beverages",
        building_location="Central Food Court & Cafeteria",
        lat=12.97120,
        lng=77.59400,
        rating=4.9,
        banner_url="/images/campus/cafeteria_banner.jpg"
    )
    db.add(vendor_1)

    vendor_2 = Vendor(
        user_id=vendor_user_2.id,
        store_name="Campus Stationer & Press",
        category="Stationery & Supplies",
        building_location="Campus Stationery & Print Press",
        lat=12.97080,
        lng=77.59320,
        rating=4.8,
        banner_url="/images/campus/stationery_banner.jpg"
    )
    db.add(vendor_2)

    vendor_3 = Vendor(
        user_id=vendor_user_3.id,
        store_name="Apex Bio-Tech Reagent Depot",
        category="Laboratory Essentials",
        building_location="Bio-Tech & Chemistry Complex",
        lat=12.97380,
        lng=77.59520,
        rating=5.0,
        banner_url="/images/campus/biolab_banner.jpg"
    )
    db.add(vendor_3)
    db.flush()

    # 4. Products with Local Verified Image Assets
    products_data = [
        # Food & Beverages (Vendor 1)
        {
            "vendor_id": vendor_1.id,
            "category_id": created_cats["food-beverages"].id,
            "name": "Artisan Grilled Avocado & Veggie Panini",
            "description": "Toasted sourdough with Hass avocado, roasted bell peppers, arugula, and basil pesto.",
            "price": 149.0,
            "stock": 40,
            "weight_kg": 0.35,
            "image_url": "/images/food/avocado_panini.jpg"
        },
        {
            "vendor_id": vendor_1.id,
            "category_id": created_cats["food-beverages"].id,
            "name": "Iced Oat-Milk Cold Brew (500ml)",
            "description": "18-hour cold steeped single-origin Arabica with organic oat milk.",
            "price": 120.0,
            "stock": 60,
            "weight_kg": 0.55,
            "image_url": "/images/food/cold_brew.jpg"
        },
        {
            "vendor_id": vendor_1.id,
            "category_id": created_cats["food-beverages"].id,
            "name": "Energizer Quinoa & Edamame Bowl",
            "description": "Organic red quinoa, steamed edamame, roasted sweet potato, tahini citrus dressing.",
            "price": 180.0,
            "stock": 25,
            "weight_kg": 0.45,
            "image_url": "/images/food/quinoa_bowl.jpg"
        },
        # Stationery & Supplies (Vendor 2)
        {
            "vendor_id": vendor_2.id,
            "category_id": created_cats["stationery"].id,
            "name": "Rotring Rapidograph Technical Drawing Pen Set",
            "description": "High-precision drafting pens (0.25mm, 0.35mm, 0.50mm) for engineering schematics.",
            "price": 450.0,
            "stock": 15,
            "weight_kg": 0.28,
            "image_url": "/images/stationery/technical_pens.jpg"
        },
        {
            "vendor_id": vendor_2.id,
            "category_id": created_cats["stationery"].id,
            "name": "Hardcover Grid Spiral Lab Notebook (240 Pages)",
            "description": "Archival quality, acid-free waterproof paper with numbered grid pages.",
            "price": 220.0,
            "stock": 50,
            "weight_kg": 0.40,
            "image_url": "/images/stationery/grid_notebook.jpg"
        },
        {
            "vendor_id": vendor_2.id,
            "category_id": created_cats["stationery"].id,
            "name": "Casio FX-991CW Advanced Scientific Calculator",
            "description": "ClassWiz series with 540+ functions, natural textbook display, and QR matrix visualization.",
            "price": 1250.0,
            "stock": 20,
            "weight_kg": 0.32,
            "image_url": "/images/stationery/scientific_calculator.jpg"
        },
        # Books (Vendor 2)
        {
            "vendor_id": vendor_2.id,
            "category_id": created_cats["books"].id,
            "name": "Introduction to Algorithms (CLRS 4th Edition)",
            "description": "The definitive comprehensive guide to computer algorithms and computational complexity.",
            "price": 1850.0,
            "stock": 10,
            "weight_kg": 1.45,
            "image_url": "/images/books/algorithms_book.jpg"
        },
        # Laboratory Essentials (Vendor 3)
        {
            "vendor_id": vendor_3.id,
            "category_id": created_cats["lab-essentials"].id,
            "name": "Sterile Filtered Pipette Tips 200uL (Rack of 96)",
            "description": "RNase, DNase, Pyrogen-free certified racked tips for molecular biology analysis.",
            "price": 680.0,
            "stock": 35,
            "weight_kg": 0.30,
            "image_url": "/images/laboratory/pipette_tips.jpg"
        },
        {
            "vendor_id": vendor_3.id,
            "category_id": created_cats["lab-essentials"].id,
            "name": "Anti-Fog UV Safety Goggles & Chemical Apron Kit",
            "description": "ANSI Z87.1 certified impact resistant goggles and heavy-duty nitrile chemical protection apron.",
            "price": 380.0,
            "stock": 25,
            "weight_kg": 0.60,
            "image_url": "/images/laboratory/safety_goggles.jpg"
        },
        # Campus Needs (Vendor 1)
        {
            "vendor_id": vendor_1.id,
            "category_id": created_cats["campus-needs"].id,
            "name": "Anker GaN 65W High-Speed USB-C Laptop Charger",
            "description": "Compact fast charger with dual USB-C ports for MacBook, iPad, and smartphone charging.",
            "price": 1899.0,
            "stock": 18,
            "weight_kg": 0.22,
            "image_url": "/images/campus/laptop_charger.jpg"
        }
    ]

    for p in products_data:
        prod = Product(**p)
        db.add(prod)
    db.flush()

    # 5. Vehicles (Autonomous Ground Robots & Drones)
    vehicles_data = [
        {
            "vehicle_code": "ROBOT-NX1",
            "vehicle_type": "robot",
            "model_name": "NexusRover UGV-Mark 3",
            "battery_percentage": 94.0,
            "current_lat": 12.97120,
            "current_lng": 77.59400,
            "speed_kmh": 0.0,
            "max_payload_kg": 25.0,
            "status": "idle",
            "is_active": True,
            "total_deliveries": 48,
            "total_distance_km": 62.4,
            "telemetry_data": {
                "temp_c": 28.2,
                "network_signal_dbm": -60,
                "motor_health": 99.8,
                "heading_deg": 90,
                "altitude_m": 0.0,
                "battery_state": "Standby Docked"
            }
        },
        {
            "vehicle_code": "ROBOT-NX2",
            "vehicle_type": "robot",
            "model_name": "NexusRover UGV-Mark 3",
            "battery_percentage": 88.5,
            "current_lat": 12.97250,
            "current_lng": 77.59380,
            "speed_kmh": 0.0,
            "max_payload_kg": 25.0,
            "status": "idle",
            "is_active": True,
            "total_deliveries": 36,
            "total_distance_km": 49.1,
            "telemetry_data": {
                "temp_c": 27.9,
                "network_signal_dbm": -63,
                "motor_health": 99.4,
                "heading_deg": 180,
                "altitude_m": 0.0,
                "battery_state": "Standby Ready"
            }
        },
        {
            "vehicle_code": "ROBOT-TITAN",
            "vehicle_type": "robot",
            "model_name": "TitanFreight Heavy Cargo Bot",
            "battery_percentage": 76.0,
            "current_lat": 12.97380,
            "current_lng": 77.59520,
            "speed_kmh": 0.0,
            "max_payload_kg": 40.0,
            "status": "idle",
            "is_active": True,
            "total_deliveries": 21,
            "total_distance_km": 34.8,
            "telemetry_data": {
                "temp_c": 31.0,
                "network_signal_dbm": -68,
                "motor_health": 98.6,
                "heading_deg": 0,
                "altitude_m": 0.0,
                "battery_state": "Standby Ready"
            }
        },
        {
            "vehicle_code": "DRONE-AERO1",
            "vehicle_type": "drone",
            "model_name": "SkyDart Octocopter Express",
            "battery_percentage": 96.0,
            "current_lat": 12.97320,
            "current_lng": 77.59780,
            "speed_kmh": 0.0,
            "max_payload_kg": 3.8,
            "status": "idle",
            "is_active": True,
            "total_deliveries": 29,
            "total_distance_km": 58.7,
            "telemetry_data": {
                "temp_c": 29.4,
                "network_signal_dbm": -55,
                "motor_health": 100.0,
                "heading_deg": 270,
                "altitude_m": 0.0,
                "battery_state": "Vertiport Charging Pad"
            }
        },
        {
            "vehicle_code": "DRONE-AERO2",
            "vehicle_type": "drone",
            "model_name": "AeroNex Heavy VTOL Courier",
            "battery_percentage": 82.0,
            "current_lat": 12.97320,
            "current_lng": 77.59780,
            "speed_kmh": 0.0,
            "max_payload_kg": 4.5,
            "status": "idle",
            "is_active": True,
            "total_deliveries": 18,
            "total_distance_km": 38.2,
            "telemetry_data": {
                "temp_c": 30.1,
                "network_signal_dbm": -58,
                "motor_health": 99.1,
                "heading_deg": 45,
                "altitude_m": 0.0,
                "battery_state": "Vertiport Pad 2"
            }
        }
    ]

    for v in vehicles_data:
        veh = Vehicle(**v)
        db.add(veh)
    db.flush()

    # 6. Notifications for demo student
    notifs = [
        {
            "user_id": student_user.id,
            "title": "Welcome to CAMPUSNEX!",
            "message": "Your campus delivery account is active. Order fresh food, lab materials, or study books with autonomous robot delivery.",
            "type": "system",
            "is_read": False
        },
        {
            "user_id": student_user.id,
            "title": "Green Campus Initiative",
            "message": "Every delivery on CAMPUSNEX is 100% electric, reducing campus combustion emissions.",
            "type": "system",
            "is_read": True
        }
    ]
    for n in notifs:
        db.add(Notification(**n))

    db.commit()
    db.close()
    print("Database successfully seeded with demo catalog, fleet, and accounts!")

def update_local_product_images(db: Session):
    """Updates existing database records to use local high-quality image paths."""
    image_map = {
        "Artisan Grilled Avocado & Veggie Panini": "/images/food/avocado_panini.jpg",
        "Iced Oat-Milk Cold Brew (500ml)": "/images/food/cold_brew.jpg",
        "Energizer Quinoa & Edamame Bowl": "/images/food/quinoa_bowl.jpg",
        "Rotring Rapidograph Technical Drawing Pen Set": "/images/stationery/technical_pens.jpg",
        "Hardcover Grid Spiral Lab Notebook (240 Pages)": "/images/stationery/grid_notebook.jpg",
        "Casio FX-991CW Advanced Scientific Calculator": "/images/stationery/scientific_calculator.jpg",
        "Introduction to Algorithms (CLRS 4th Edition)": "/images/books/algorithms_book.jpg",
        "Sterile Filtered Pipette Tips 200uL (Rack of 96)": "/images/laboratory/pipette_tips.jpg",
        "Anti-Fog UV Safety Goggles & Chemical Apron Kit": "/images/laboratory/safety_goggles.jpg",
        "Anker GaN 65W High-Speed USB-C Laptop Charger": "/images/campus/laptop_charger.jpg"
    }

    products = db.query(Product).all()
    for p in products:
        if p.name in image_map:
            p.image_url = image_map[p.name]
    
    # Also update vendor banners
    v1 = db.query(Vendor).filter(Vendor.id == 1).first()
    if v1: v1.banner_url = "/images/campus/cafeteria_banner.jpg"
    v2 = db.query(Vendor).filter(Vendor.id == 2).first()
    if v2: v2.banner_url = "/images/campus/stationery_banner.jpg"
    v3 = db.query(Vendor).filter(Vendor.id == 3).first()
    if v3: v3.banner_url = "/images/campus/biolab_banner.jpg"

    db.commit()

if __name__ == "__main__":
    seed_database()
