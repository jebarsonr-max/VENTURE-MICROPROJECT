export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'vendor' | 'admin';
  phone?: string;
  campus_id?: string;
  hostel_block?: string;
  is_active: boolean;
  created_at: string;
}

export interface Vendor {
  id: number;
  user_id: number;
  store_name: string;
  category: string;
  building_location: string;
  lat: number;
  lng: number;
  rating: number;
  banner_url?: string;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Product {
  id: number;
  vendor_id: number;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  weight_kg: number;
  is_available: boolean;
  created_at: string;
  category?: Category;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  unit_weight_kg: number;
}

export interface Vehicle {
  id: number;
  vehicle_code: string;
  vehicle_type: 'robot' | 'drone';
  model_name: string;
  battery_percentage: number;
  current_lat: number;
  current_lng: number;
  speed_kmh: number;
  max_payload_kg: number;
  status: 'idle' | 'en_route_pickup' | 'delivering' | 'returning' | 'charging' | 'maintenance';
  is_active: boolean;
  total_deliveries: number;
  total_distance_km: number;
  telemetry_data?: Record<string, any>;
  last_ping?: string;
}

export interface DeliveryAssignment {
  id: number;
  order_id: number;
  vehicle_id: number;
  assigned_at: string;
  pickup_location_name: string;
  pickup_lat: number;
  pickup_lng: number;
  destination_location_name: string;
  destination_lat: number;
  destination_lng: number;
  estimated_distance_km: number;
  estimated_duration_mins: number;
  actual_duration_mins?: number;
  route_waypoints?: [number, number][];
  assignment_reason?: string;
  routing_algorithm?: string;
  status: string;
  current_step_index: number;
  completed_at?: string;
  vehicle?: Vehicle;
}

export interface Order {
  id: number;
  order_number: string;
  student_id: number;
  vendor_id: number;
  status: 'pending' | 'vendor_accepted' | 'preparing' | 'ready_for_pickup' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  priority: 'normal' | 'high' | 'urgent';
  total_amount: number;
  delivery_fee: number;
  total_weight_kg: number;
  delivery_location_name: string;
  delivery_lat: number;
  delivery_lng: number;
  delivery_notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  assignment?: DeliveryAssignment;
  vendor?: Vendor;
  student?: User;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'order' | 'vehicle' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface CampusNode {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  description: string;
  elevation_m: number;
}

export interface RouteSolverResult {
  start_node: string;
  end_node: string;
  vehicle_type: string;
  algorithm: string;
  total_distance_km: number;
  estimated_duration_mins: number;
  path_nodes: string[];
  waypoints: [number, number][];
  steps_log: any[];
  explanation: string;
}

export interface SustainabilityMetrics {
  total_deliveries_completed: number;
  total_distance_travelled_km: number;
  estimated_co2_avoided_kg: number;
  petrol_litres_saved: number;
  clean_kwh_consumed: number;
  robot_delivery_pct: number;
  drone_delivery_pct: number;
  avg_delivery_time_mins: number;
  calculation_basis: string;
}
