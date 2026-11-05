import asyncio
import os
import datetime
import random
from typing import Optional
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.models.models import Order, Vehicle, DeliveryAssignment, TrackingHistory, Notification

class FleetSimulator:
    def __init__(self):
        self.is_running = False
        self._task: Optional[asyncio.Task] = None

    def start(self):
        if self.is_running:
            return
        self.is_running = True
        try:
            loop = asyncio.get_running_loop()
            self._task = loop.create_task(self._simulation_loop())
        except RuntimeError:
            pass

    def stop(self):
        self.is_running = False
        if self._task and not self._task.done():
            self._task.cancel()

    async def _simulation_loop(self):
        """Periodic simulation tick updating active deliveries every 3 seconds."""
        try:
            while self.is_running:
                try:
                    db = SessionLocal()
                    self.step_active_assignments(db)
                    db.close()
                except Exception:
                    pass
                await asyncio.sleep(3.0)
        except asyncio.CancelledError:
            pass

    def step_active_assignments(self, db: Session):
        assignments = db.query(DeliveryAssignment).filter(
            DeliveryAssignment.status.in_(["assigned", "moving_to_vendor", "picking_up", "in_transit"])
        ).all()

        for assign in assignments:
            self.advance_assignment_step(assign, db)

        # Idle vehicles recharge slowly if battery < 95%
        idle_vehicles = db.query(Vehicle).filter(Vehicle.status == "idle").all()
        for v in idle_vehicles:
            if v.battery_percentage < 99.0:
                v.battery_percentage = min(100.0, v.battery_percentage + 0.2)
                # Jitter telemetry for realistic IoT display
                v.telemetry_data = {
                    "temp_c": round(28.0 + random.uniform(-0.5, 0.8), 1),
                    "network_signal_dbm": random.randint(-65, -55),
                    "motor_health": 99.4,
                    "heading_deg": random.randint(0, 360),
                    "altitude_m": 0.0,
                    "battery_state": "Trickle Charging"
                }
                v.last_ping = datetime.datetime.utcnow()
        
        db.commit()

    def advance_assignment_step(self, assign: DeliveryAssignment, db: Session) -> bool:
        """Advance assignment by one waypoint step. Returns True if updated."""
        vehicle: Vehicle = assign.vehicle
        order: Order = assign.order
        waypoints = assign.route_waypoints or []

        if not waypoints:
            return False

        total_steps = len(waypoints)
        idx = assign.current_step_index

        if idx >= total_steps - 1:
            # Reached destination!
            assign.status = "arrived"
            assign.completed_at = datetime.datetime.utcnow()
            vehicle.status = "idle"
            vehicle.speed_kmh = 0.0
            order.status = "delivered"
            order.updated_at = datetime.datetime.utcnow()
            vehicle.total_deliveries += 1
            vehicle.total_distance_km = round(vehicle.total_distance_km + assign.estimated_distance_km, 2)

            # Create completion notification
            notif = Notification(
                user_id=order.student_id,
                title="Delivery Arrived! 🎉",
                message=f"Vehicle {vehicle.vehicle_code} has safely arrived at {assign.destination_location_name}. Please collect your order #{order.order_number}.",
                type="order"
            )
            db.add(notif)
            db.commit()
            return True

        # Progress to next waypoint
        next_idx = min(idx + 1, total_steps - 1)
        assign.current_step_index = next_idx
        next_point = waypoints[next_idx]

        # Determine phase
        halfway = total_steps // 3
        if next_idx < halfway:
            assign.status = "moving_to_vendor"
            vehicle.status = "en_route_pickup"
            order.status = "vendor_accepted"
            phase_note = "En route to vendor pickup bay"
        elif next_idx == halfway:
            assign.status = "picking_up"
            vehicle.status = "en_route_pickup"
            order.status = "ready_for_pickup"
            phase_note = "Loading cargo at vendor"
        else:
            assign.status = "in_transit"
            vehicle.status = "delivering"
            order.status = "in_transit"
            phase_note = "Delivering to customer destination"

        # Update vehicle position & battery
        vehicle.current_lat = next_point[0]
        vehicle.current_lng = next_point[1]
        burn = 0.15 if vehicle.vehicle_type == "drone" else 0.08
        vehicle.battery_percentage = max(5.0, round(vehicle.battery_percentage - burn, 2))
        
        speed = 42.0 if vehicle.vehicle_type == "drone" else 14.5
        vehicle.speed_kmh = round(speed + random.uniform(-1.5, 1.5), 1)

        altitude = 48.0 if vehicle.vehicle_type == "drone" else 0.0
        vehicle.telemetry_data = {
            "temp_c": round(34.2 + random.uniform(-0.8, 1.2), 1),
            "network_signal_dbm": random.randint(-72, -60),
            "motor_health": round(98.5 - (next_idx * 0.02), 1),
            "heading_deg": random.randint(45, 180),
            "altitude_m": altitude,
            "battery_state": "Discharging (Active Motor Load)"
        }
        vehicle.last_ping = datetime.datetime.utcnow()

        # Record tracking history point
        history_entry = TrackingHistory(
            assignment_id=assign.id,
            vehicle_id=vehicle.id,
            lat=next_point[0],
            lng=next_point[1],
            battery_percentage=vehicle.battery_percentage,
            speed_kmh=vehicle.speed_kmh,
            event_note=f"{phase_note} (Step {next_idx + 1}/{total_steps})"
        )
        db.add(history_entry)
        db.commit()
        return True

simulator = FleetSimulator()
