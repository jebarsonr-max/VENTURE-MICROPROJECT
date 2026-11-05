import math
import heapq
from typing import Dict, List, Tuple, Any, Optional

# Campus Coordinate System (Sample Tech University Campus)
# Realistic campus scale: ~1.2 km x 1.0 km
CAMPUS_NODES = {
    "food_court": {
        "id": "food_court",
        "name": "Central Food Court & Cafeteria",
        "type": "vendor",
        "lat": 12.97120,
        "lng": 77.59400,
        "description": "Primary dining hall and hot food preparation hub",
        "elevation_m": 910
    },
    "central_library": {
        "id": "central_library",
        "name": "Dr. Kalam Central Library",
        "type": "academic",
        "lat": 12.97250,
        "lng": 77.59380,
        "description": "Multi-floor study center, book repository, and quiet zone",
        "elevation_m": 912
    },
    "science_labs": {
        "id": "science_labs",
        "name": "Bio-Tech & Chemistry Complex",
        "type": "lab",
        "lat": 12.97380,
        "lng": 77.59520,
        "description": "Hazardous lab reagent and precision equipment pickup bay",
        "elevation_m": 914
    },
    "engineering_block": {
        "id": "engineering_block",
        "name": "Turing Engineering & Robotics Quad",
        "type": "academic",
        "lat": 12.97020,
        "lng": 77.59550,
        "description": "Computer science, electronics labs, and hardware fabrication",
        "elevation_m": 910
    },
    "hostel_alpha": {
        "id": "hostel_alpha",
        "name": "Hostel Alpha (North Wing)",
        "type": "residential",
        "lat": 12.97450,
        "lng": 77.59250,
        "description": "Undergraduate residential residence - Block A",
        "elevation_m": 915
    },
    "hostel_beta": {
        "id": "hostel_beta",
        "name": "Hostel Beta (West Wing)",
        "type": "residential",
        "lat": 12.96920,
        "lng": 77.59200,
        "description": "Senior student residence & graduate suites",
        "elevation_m": 908
    },
    "hostel_gamma": {
        "id": "hostel_gamma",
        "name": "Hostel Gamma (East Wing)",
        "type": "residential",
        "lat": 12.96880,
        "lng": 77.59680,
        "description": "Postgraduate student apartments and guest house",
        "elevation_m": 907
    },
    "sports_arena": {
        "id": "sports_arena",
        "name": "Olympic Sports Arena & Gym",
        "type": "recreation",
        "lat": 12.97520,
        "lng": 77.59700,
        "description": "Track, stadium field, indoor courts, and fitness center",
        "elevation_m": 916
    },
    "admin_building": {
        "id": "admin_building",
        "name": "Senate & Administrative Block",
        "type": "admin",
        "lat": 12.97180,
        "lng": 77.59620,
        "description": "Registrar, bursar, and chancellor offices",
        "elevation_m": 912
    },
    "drone_vertiport": {
        "id": "drone_vertiport",
        "name": "Campus SkyDock & Drone Vertiport",
        "type": "infrastructure",
        "lat": 12.97320,
        "lng": 77.59780,
        "description": "Automated drone battery swap stations and aerial dispatch tower",
        "elevation_m": 925
    },
    "stationer_hub": {
        "id": "stationer_hub",
        "name": "Campus Stationery & Print Press",
        "type": "vendor",
        "lat": 12.97080,
        "lng": 77.59320,
        "description": "Printing, architectural drafting supplies, and stationery",
        "elevation_m": 910
    }
}

# Ground Network: Paved pathways for autonomous ground robots (UGVs)
# Weights are actual walking/driving distance in kilometers
GROUND_EDGES: List[Tuple[str, str, float]] = [
    ("food_court", "stationer_hub", 0.12),
    ("food_court", "central_library", 0.18),
    ("food_court", "admin_building", 0.25),
    ("food_court", "engineering_block", 0.22),
    ("stationer_hub", "hostel_beta", 0.23),
    ("central_library", "hostel_alpha", 0.27),
    ("central_library", "science_labs", 0.24),
    ("central_library", "admin_building", 0.20),
    ("science_labs", "hostel_alpha", 0.32),
    ("science_labs", "sports_arena", 0.28),
    ("science_labs", "drone_vertiport", 0.29),
    ("sports_arena", "drone_vertiport", 0.24),
    ("admin_building", "engineering_block", 0.21),
    ("admin_building", "drone_vertiport", 0.28),
    ("engineering_block", "hostel_beta", 0.36),
    ("engineering_block", "hostel_gamma", 0.26),
    ("drone_vertiport", "hostel_gamma", 0.45),
    ("hostel_beta", "central_library", 0.38),
]

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine formula to compute great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0 # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class CampusGraph:
    def __init__(self):
        self.nodes = CAMPUS_NODES
        self.adj: Dict[str, List[Tuple[str, float]]] = {node: [] for node in CAMPUS_NODES}
        for u, v, w in GROUND_EDGES:
            if u in self.adj and v in self.adj:
                self.adj[u].append((v, w))
                self.adj[v].append((u, w))

    def find_nearest_node(self, lat: float, lng: float) -> str:
        """Find the campus node closest to a given lat/lng coordinate."""
        closest = None
        min_dist = float("inf")
        for node_id, data in self.nodes.items():
            d = haversine_distance(lat, lng, data["lat"], data["lng"])
            if d < min_dist:
                min_dist = d
                closest = node_id
        return closest or "food_court"

    def dijkstra_shortest_path(self, start_id: str, end_id: str) -> Dict[str, Any]:
        """
        Calculates the deterministic shortest ground path using Dijkstra's Algorithm.
        Returns distance, route path, waypoints, and step-by-step exploration metrics.
        """
        if start_id not in self.nodes or end_id not in self.nodes:
            raise ValueError(f"Start node '{start_id}' or end node '{end_id}' does not exist.")

        distances = {node: float("inf") for node in self.nodes}
        previous: Dict[str, Optional[str]] = {node: None for node in self.nodes}
        distances[start_id] = 0.0
        
        pq = [(0.0, start_id)]
        visited = set()
        steps_log = []

        while pq:
            curr_dist, curr_node = heapq.heappop(pq)
            if curr_node in visited:
                continue
            visited.add(curr_node)

            steps_log.append({
                "node": curr_node,
                "node_name": self.nodes[curr_node]["name"],
                "cumulative_dist_km": round(curr_dist, 3),
                "neighbors_explored": len(self.adj.get(curr_node, []))
            })

            if curr_node == end_id:
                break

            for neighbor, weight in self.adj.get(curr_node, []):
                if neighbor in visited:
                    continue
                new_dist = curr_dist + weight
                if new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    previous[neighbor] = curr_node
                    heapq.heappush(pq, (new_dist, neighbor))

        # Reconstruct path
        path = []
        curr = end_id
        while curr is not None:
            path.append(curr)
            curr = previous[curr]
        path.reverse()

        if not path or path[0] != start_id:
            # Fallback if disconnected
            path = [start_id, end_id]
            total_dist = haversine_distance(
                self.nodes[start_id]["lat"], self.nodes[start_id]["lng"],
                self.nodes[end_id]["lat"], self.nodes[end_id]["lng"]
            )
        else:
            total_dist = distances[end_id]

        waypoints = [[self.nodes[n]["lat"], self.nodes[n]["lng"]] for n in path]
        interpolated = self.interpolate_waypoints(waypoints, max_step_km=0.03)

        return {
            "path": path,
            "total_distance_km": round(total_dist, 3),
            "waypoints": waypoints,
            "dense_waypoints": interpolated,
            "steps_log": steps_log,
            "algorithm": "Dijkstra's Algorithm"
        }

    def astar_shortest_path(self, start_id: str, end_id: str) -> Dict[str, Any]:
        """
        A* Search Algorithm utilizing Haversine Euclidean Distance as an admissible heuristic.
        Guarantees optimal path while exploring fewer states.
        """
        if start_id not in self.nodes or end_id not in self.nodes:
            raise ValueError(f"Start node '{start_id}' or end node '{end_id}' does not exist.")

        goal_lat = self.nodes[end_id]["lat"]
        goal_lng = self.nodes[end_id]["lng"]

        def heuristic(node_id: str) -> float:
            return haversine_distance(self.nodes[node_id]["lat"], self.nodes[node_id]["lng"], goal_lat, goal_lng)

        g_score = {node: float("inf") for node in self.nodes}
        g_score[start_id] = 0.0
        f_score = {node: float("inf") for node in self.nodes}
        f_score[start_id] = heuristic(start_id)

        pq = [(f_score[start_id], start_id)]
        previous: Dict[str, Optional[str]] = {node: None for node in self.nodes}
        visited = set()
        steps_log = []

        while pq:
            curr_f, curr_node = heapq.heappop(pq)
            if curr_node in visited:
                continue
            visited.add(curr_node)

            steps_log.append({
                "node": curr_node,
                "node_name": self.nodes[curr_node]["name"],
                "g_score_km": round(g_score[curr_node], 3),
                "h_score_km": round(heuristic(curr_node), 3),
                "f_score_km": round(curr_f, 3)
            })

            if curr_node == end_id:
                break

            for neighbor, weight in self.adj.get(curr_node, []):
                if neighbor in visited:
                    continue
                tentative_g = g_score[curr_node] + weight
                if tentative_g < g_score[neighbor]:
                    previous[neighbor] = curr_node
                    g_score[neighbor] = tentative_g
                    f_score[neighbor] = tentative_g + heuristic(neighbor)
                    heapq.heappush(pq, (f_score[neighbor], neighbor))

        path = []
        curr = end_id
        while curr is not None:
            path.append(curr)
            curr = previous[curr]
        path.reverse()

        if not path or path[0] != start_id:
            path = [start_id, end_id]
            total_dist = haversine_distance(
                self.nodes[start_id]["lat"], self.nodes[start_id]["lng"],
                self.nodes[end_id]["lat"], self.nodes[end_id]["lng"]
            )
        else:
            total_dist = g_score[end_id]

        waypoints = [[self.nodes[n]["lat"], self.nodes[n]["lng"]] for n in path]
        interpolated = self.interpolate_waypoints(waypoints, max_step_km=0.03)

        return {
            "path": path,
            "total_distance_km": round(total_dist, 3),
            "waypoints": waypoints,
            "dense_waypoints": interpolated,
            "steps_log": steps_log,
            "algorithm": "A* Heuristic Search"
        }

    def drone_aerial_corridor(self, start_id: str, end_id: str) -> Dict[str, Any]:
        """
        Computes direct Aerial Flight Corridor for Autonomous Delivery Drones.
        Drones bypass surface winding paths, flying direct line-of-sight with take-off and landing ascent points.
        """
        start = self.nodes[start_id]
        end = self.nodes[end_id]

        direct_dist = haversine_distance(start["lat"], start["lng"], end["lat"], end["lng"])

        # Midpoint elevation altitude waypoints
        mid_lat = (start["lat"] + end["lat"]) / 2
        mid_lng = (start["lng"] + end["lng"]) / 2

        waypoints = [
            [start["lat"], start["lng"]],
            [mid_lat, mid_lng],
            [end["lat"], end["lng"]]
        ]
        interpolated = self.interpolate_waypoints(waypoints, max_step_km=0.02)

        return {
            "path": [start_id, f"aerial_corridor_{start_id}_{end_id}", end_id],
            "total_distance_km": round(direct_dist, 3),
            "waypoints": waypoints,
            "dense_waypoints": interpolated,
            "steps_log": [
                {"event": "Vertical Takeoff", "altitude_m": 45},
                {"event": "Cruising Corridor", "altitude_m": 50, "speed_kmh": 45.0},
                {"event": "Precision Hover & Descent", "altitude_m": 0}
            ],
            "algorithm": "3D Direct Aerial Corridor"
        }

    def interpolate_waypoints(self, waypoints: List[List[float]], max_step_km: float = 0.025) -> List[List[float]]:
        """Dense coordinate generation for smooth simulation animation along polyline segments."""
        if len(waypoints) < 2:
            return waypoints

        dense = [waypoints[0]]
        for i in range(len(waypoints) - 1):
            p1 = waypoints[i]
            p2 = waypoints[i + 1]
            seg_dist = haversine_distance(p1[0], p1[1], p2[0], p2[1])
            num_steps = max(1, int(seg_dist / max_step_km))
            for s in range(1, num_steps + 1):
                fraction = s / num_steps
                lat = p1[0] + (p2[0] - p1[0]) * fraction
                lng = p1[1] + (p2[1] - p1[1]) * fraction
                dense.append([round(lat, 6), round(lng, 6)])

        return dense

campus_graph = CampusGraph()

