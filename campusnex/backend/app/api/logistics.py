from fastapi import APIRouter
from typing import Dict, Any, List
from app.algorithms.campus_graph import campus_graph, CAMPUS_NODES
from app.schemas.schemas import RouteCalculationRequest, RouteCalculationResponse

router = APIRouter(prefix="/logistics", tags=["Smart Logistics Engine"])

@router.get("/campus-nodes")
def get_campus_nodes() -> Dict[str, Any]:
    """Returns all campus waypoint facilities with GPS coordinates and descriptions."""
    return CAMPUS_NODES

@router.post("/calculate-route", response_model=RouteCalculationResponse)
def calculate_route(request: RouteCalculationRequest):
    """
    Solves optimal navigation path across campus using Dijkstra, A*, or Aerial Corridor.
    Returns step-by-step algorithmic exploration logs and waypoints.
    """
    start = request.start_node
    end = request.end_node
    v_type = request.vehicle_type
    algo = request.algorithm

    if v_type == "drone":
        result = campus_graph.drone_aerial_corridor(start, end)
        speed = 45.0
        explanation = (
            f"Drone direct aerial flight corridor calculated between {CAMPUS_NODES[start]['name']} "
            f"and {CAMPUS_NODES[end]['name']}. Bypasses surface pedestrian congestion, cruising at 45m AGL."
        )
    else:
        if algo == "astar":
            result = campus_graph.astar_shortest_path(start, end)
            speed = 15.0
            explanation = (
                f"A* Heuristic path found using Haversine Euclidean distance as admissible heuristic h(n). "
                f"Explored {len(result['steps_log'])} search states along campus paved walkways."
            )
        else:
            result = campus_graph.dijkstra_shortest_path(start, end)
            speed = 15.0
            explanation = (
                f"Dijkstra's Single-Source Shortest Path solved across campus topological graph. "
                f"Cumulative distance: {result['total_distance_km']} km with zero heuristic bias."
            )

    eta_mins = round((result["total_distance_km"] / speed) * 60 + 1.2, 1)

    return {
        "start_node": start,
        "end_node": end,
        "vehicle_type": v_type,
        "algorithm": result["algorithm"],
        "total_distance_km": result["total_distance_km"],
        "estimated_duration_mins": eta_mins,
        "path_nodes": result["path"],
        "waypoints": result["waypoints"],
        "steps_log": result["steps_log"],
        "explanation": explanation
    }

