# CAMPUSNEX — End-to-End Order & Delivery Lifecycle Workflow

This document illustrates the complete lifecycle workflow from initial student ordering to vendor kitchen preparation, autonomous vehicle assignment, live GPS tracking, and final package handover.

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as Frontend (React)
    participant API as FastAPI Backend
    participant Engine as Logistics Dispatcher
    actor Vendor
    participant Robot as Autonomous UGV / Drone

    Student->>UI: Browse products, add to cart
    Student->>UI: Select campus destination & priority (Normal / High / Urgent)
    Student->>API: POST /api/v1/orders (Place Order)
    API-->>Student: Return Order Confirmation (#CNX-...)
    
    Vendor->>API: GET /api/v1/orders/vendor (Poll incoming orders)
    Vendor->>API: POST /api/v1/orders/{id}/vendor-status ("vendor_accepted")
    Vendor->>API: POST /api/v1/orders/{id}/vendor-status ("preparing")
    Vendor->>API: POST /api/v1/orders/{id}/vendor-status ("ready_for_pickup")
    
    Note over API,Engine: Trigger Autonomous Dispatch Algorithm
    API->>Engine: dispatch_best_vehicle(order, db)
    Engine->>Engine: Validate payload capacity & battery reserves
    Engine->>Engine: Compute Dijkstra / Aerial shortest route
    Engine-->>API: Assign Robot/Drone with rationale
    
    API->>Robot: Dispatch vehicle to vendor pickup bay
    API->>Student: Push notification ("Vehicle Dispatched! 🚀")
    
    loop Real-Time Telemetry Simulation (Every 3s)
        Robot->>API: Update coordinates, speed, battery, sensor telemetry
        Student->>UI: Watch vehicle move smoothly on Leaflet Map
    end

    Note over Robot,Student: Vehicle arrives at student hostel
    Robot->>API: Status -> "arrived"
    API->>Student: Push notification ("Delivery Arrived! 🎉")
    
    Student->>UI: Click "Confirm Delivery"
    UI->>API: POST /api/v1/orders/{id}/confirm_delivery
    API-->>Robot: Release cargo hatch & return vehicle to idle charging dock
    API-->>Student: Order marked completed & log sustainability savings!
```

---

## State Transition Machine

| Status | Actor Trigger | Action Taken | Next Legal States |
| :--- | :--- | :--- | :--- |
| `pending` | Student | Order submitted, stock decremented | `vendor_accepted`, `cancelled` |
| `vendor_accepted` | Vendor | Kitchen verifies items and prepares station | `preparing`, `cancelled` |
| `preparing` | Vendor | Cooking / packaging cargo | `ready_for_pickup`, `cancelled` |
| `ready_for_pickup` | Vendor | Triggers automatic fleet dispatch engine | `assigned` |
| `assigned` | Dispatch Engine | Nearest compliant robot or drone dispatched | `in_transit` |
| `in_transit` | Simulator / Vehicle | Traversing waypoints with live GPS & sensor stream | `delivered`, `failed` |
| `delivered` | Student / Auto | Cargo safely retrieved, vehicle returned to dock | Terminal State |
| `cancelled` | Student / Vendor | Restocks inventory, cancels assignment | Terminal State |

