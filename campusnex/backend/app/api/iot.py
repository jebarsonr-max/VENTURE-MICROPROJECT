import random
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.models.models import Vehicle

router = APIRouter(prefix="/iot", tags=["IoT Monitoring & Telemetry"])

@router.get("/telemetry-feed")
def get_live_iot_telemetry(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Simulated live IoT telemetry feed for all deployed delivery vehicles.
    Designed for MQTT/CoAP broker integration in physical IoT deployment.
    """
    vehicles = db.query(Vehicle).all()
    feed_data = []

    for v in vehicles:
        base_temp = 32.5 if v.status in ["delivering", "en_route_pickup"] else 26.5
        vibration_g = 0.45 if v.vehicle_type == "robot" and v.status != "idle" else 0.08
        feed_data.append({
            "vehicle_id": v.id,
            "vehicle_code": v.vehicle_code,
            "vehicle_type": v.vehicle_type,
            "model_name": v.model_name,
            "status": v.status,
            "battery_percentage": round(v.battery_percentage, 1),
            "speed_kmh": round(v.speed_kmh, 1),
            "lat": round(v.current_lat, 6),
            "lng": round(v.current_lng, 6),
            "sensors": {
                "core_temp_c": round(base_temp + random.uniform(-0.6, 1.2), 1),
                "vibration_g": round(vibration_g + random.uniform(-0.04, 0.05), 3),
                "network_latency_ms": random.randint(18, 42),
                "rssi_dbm": random.randint(-68, -54),
                "lidar_status": "NORMAL_OK" if v.vehicle_type == "robot" else "ALTITUDE_SONAR_LOCKED",
                "imu_pitch_deg": round(random.uniform(-1.8, 2.1), 2),
                "imu_roll_deg": round(random.uniform(-1.2, 1.5), 2),
                "gps_satellites_locked": random.randint(14, 22),
            },
            "last_heartbeat": datetime.datetime.utcnow().isoformat()
        })

    return {
        "status": "ONLINE",
        "broker_protocol": "Simulated MQTT v5.0 (Ready for broker ws://broker.hivemq.com:8000/mqtt)",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "total_active_nodes": len(vehicles),
        "telemetry": feed_data
    }

