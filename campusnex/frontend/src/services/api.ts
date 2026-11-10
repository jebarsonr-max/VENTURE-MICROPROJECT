import {
  User,
  Vendor,
  Category,
  Product,
  Order,
  Vehicle,
  CampusNode,
  RouteSolverResult,
  SustainabilityMetrics,
  Notification
} from '../types';
import {
  MOCK_CATEGORIES,
  MOCK_VENDORS,
  MOCK_PRODUCTS,
  MOCK_CAMPUS_NODES,
  MOCK_VEHICLES,
  MOCK_USERS,
  MOCK_ORDERS,
  MOCK_SUSTAINABILITY
} from './mockData';

const API_URL = (((import.meta as any).env?.VITE_API_URL as string) || '').replace(/\/$/, '');
const API_BASE = `${API_URL}/api/v1`;

let isBackendOnline: boolean | null = null;
let lastCheckTime = 0;

// Probes backend with a strict 800ms abort timeout so it never hangs or lags the UI
async function probeBackend(): Promise<boolean> {
  if (!API_URL && typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    isBackendOnline = false;
    return false;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 800);
    const res = await fetch(`${API_BASE}/products/categories`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      isBackendOnline = true;
      lastCheckTime = Date.now();
      return true;
    }
  } catch {
    // Backend offline / unreachable
  }
  isBackendOnline = false;
  lastCheckTime = Date.now();
  return false;
}

if (typeof window !== 'undefined') {
  probeBackend();
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('campusnex_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem('campusnex_mock_orders');
    return raw ? JSON.parse(raw) : MOCK_ORDERS;
  } catch {
    return MOCK_ORDERS;
  }
}

function saveStoredOrders(orders: Order[]) {
  try {
    localStorage.setItem('campusnex_mock_orders', JSON.stringify(orders));
  } catch {}
}

function getStoredVehicles(): Vehicle[] {
  try {
    const raw = localStorage.getItem('campusnex_mock_vehicles');
    return raw ? JSON.parse(raw) : MOCK_VEHICLES;
  } catch {
    return MOCK_VEHICLES;
  }
}

function saveStoredVehicles(vehicles: Vehicle[]) {
  try {
    localStorage.setItem('campusnex_mock_vehicles', JSON.stringify(vehicles));
  } catch {}
}

function handleMockFallback(endpoint: string, options: RequestInit = {}): any {
  const method = (options.method || 'GET').toUpperCase();
  const url = new URL(endpoint, 'http://localhost');
  const pathname = url.pathname;
  const searchParams = url.searchParams;

  // 1. Categories
  if (pathname === '/products/categories') {
    return MOCK_CATEGORIES;
  }

  // 2. Products
  if (pathname === '/products') {
    let prods = [...MOCK_PRODUCTS];
    const catSlug = searchParams.get('category_slug');
    const vendorId = searchParams.get('vendor_id');
    const search = searchParams.get('search')?.toLowerCase();

    if (catSlug) {
      const cat = MOCK_CATEGORIES.find((c) => c.slug === catSlug);
      if (cat) prods = prods.filter((p) => p.category_id === cat.id);
    }
    if (vendorId) {
      prods = prods.filter((p) => p.vendor_id === parseInt(vendorId));
    }
    if (search) {
      prods = prods.filter(
        (p) => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)
      );
    }
    return prods;
  }

  if (pathname.startsWith('/products/')) {
    const id = parseInt(pathname.replace('/products/', ''));
    const prod = MOCK_PRODUCTS.find((p) => p.id === id);
    if (prod) return prod;
  }

  // 3. Vendors
  if (pathname === '/vendors') {
    return MOCK_VENDORS;
  }
  if (pathname === '/vendors/metrics') {
    return {
      total_orders: 14,
      pending_orders: 2,
      today_revenue: 3480,
      avg_prep_time_mins: 6.5,
      completed_today: 12,
    };
  }

  // 4. Vehicles
  if (pathname === '/vehicles') {
    return getStoredVehicles();
  }
  if (pathname.includes('/recharge')) {
    const parts = pathname.split('/');
    const id = parseInt(parts[2]);
    const vehicles = getStoredVehicles().map((v) =>
      v.id === id ? { ...v, battery_percentage: 100, status: 'idle' as const } : v
    );
    saveStoredVehicles(vehicles);
    return vehicles.find((v) => v.id === id);
  }
  if (pathname.startsWith('/vehicles/') && method === 'PATCH') {
    const id = parseInt(pathname.replace('/vehicles/', ''));
    const body = options.body ? JSON.parse(options.body as string) : {};
    const vehicles = getStoredVehicles().map((v) => (v.id === id ? { ...v, ...body } : v));
    saveStoredVehicles(vehicles);
    return vehicles.find((v) => v.id === id);
  }
  if (pathname.startsWith('/vehicles/')) {
    const id = parseInt(pathname.replace('/vehicles/', ''));
    return getStoredVehicles().find((v) => v.id === id) || MOCK_VEHICLES[0];
  }

  // 5. Campus Nodes
  if (pathname === '/logistics/campus-nodes') {
    return MOCK_CAMPUS_NODES;
  }
  if (pathname === '/logistics/calculate-route') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const startKey = body.start_node || 'food_court';
    const endKey = body.end_node || 'hostel_alpha';
    const start = MOCK_CAMPUS_NODES[startKey] || MOCK_CAMPUS_NODES.food_court || MOCK_CAMPUS_NODES.CAFETERIA;
    const end = MOCK_CAMPUS_NODES[endKey] || MOCK_CAMPUS_NODES.hostel_alpha || MOCK_CAMPUS_NODES.HOSTEL_A;
    const isDrone = body.vehicle_type === 'drone';
    const algoName = isDrone ? 'Direct 3D Flight Corridor' : (body.algorithm === 'astar' ? 'A* Heuristic Search' : "Dijkstra's Shortest Path");

    const midPoint: [number, number] = [
      (start.lat + end.lat) / 2 + 0.0003,
      (start.lng + end.lng) / 2 - 0.0002,
    ];

    const dist = isDrone ? 0.48 : 0.65;
    const duration = isDrone ? 3.2 : 6.8;

    return {
      start_node: startKey,
      end_node: endKey,
      vehicle_type: isDrone ? 'drone' : 'robot',
      algorithm: algoName,
      total_distance_km: dist,
      estimated_duration_mins: duration,
      path_nodes: [startKey, 'central_library', endKey],
      waypoints: [
        [start.lat, start.lng],
        midPoint,
        [end.lat, end.lng],
      ],
      steps_log: [
        { node_name: `Origin: ${start.name}`, cumulative_dist_km: 0.0, event: 'Initialized Start Node' },
        { node_name: `Waypoint: Central Campus Node`, cumulative_dist_km: 0.28, event: 'Traversal via Paved Campus Walkway' },
        { node_name: `Goal: ${end.name}`, cumulative_dist_km: dist, event: 'Optimal Path Found (Cost Minimized)' },
      ],
      explanation: isDrone
        ? `Direct 3D UAV Air Corridor calculated between ${start.name} and ${end.name}. Bypasses surface pedestrian traffic at 45m AGL.`
        : `Optimal path computed using ${algoName}. Traverses campus paved ground walkways with zero collision probability.`,
    };
  }

  // 6. Sustainability
  if (pathname === '/sustainability/metrics') {
    return MOCK_SUSTAINABILITY;
  }

  // 7. IoT Telemetry
  if (pathname === '/iot/telemetry-feed') {
    const vehicles = getStoredVehicles();
    return {
      status: 'ONLINE',
      broker_protocol: 'Simulated MQTT v5.0 (CoAP / WebSocket Bridge)',
      timestamp: new Date().toISOString(),
      total_active_nodes: vehicles.length,
      telemetry: vehicles.map((v) => {
        const isDrone = v.vehicle_type === 'drone';
        const isDelivering = v.status === 'delivering' || v.status === 'en_route_pickup';
        return {
          vehicle_id: v.id,
          vehicle_code: v.vehicle_code,
          vehicle_type: v.vehicle_type,
          model_name: v.model_name,
          status: v.status,
          battery_percentage: Math.round(v.battery_percentage),
          speed_kmh: v.speed_kmh,
          lat: v.current_lat,
          lng: v.current_lng,
          current_altitude_m: isDrone ? 35.0 : 0.0,
          sensors: {
            core_temp_c: Math.round((isDelivering ? 34.5 : 28.2 + Math.random() * 2) * 10) / 10,
            vibration_g: isDrone ? 0.08 : isDelivering ? 0.42 : 0.04,
            network_latency_ms: Math.floor(18 + Math.random() * 12),
            rssi_dbm: Math.floor(-64 + Math.random() * 6),
            lidar_status: isDrone ? 'ALTITUDE_SONAR_LOCKED (35m AGL)' : 'NORMAL_OK (LiDAR Surface Mesh Locked)',
            imu_pitch_deg: 0.4,
            imu_roll_deg: -0.2,
            gps_satellites_locked: Math.floor(16 + Math.random() * 4),
          },
          last_heartbeat: new Date().toISOString(),
        };
      }),
    };
  }

  // 8. Notifications
  if (pathname === '/notifications') {
    return [
      {
        id: 1,
        title: 'Autonomous Fleet Online',
        message: 'All 5 campus delivery rovers and VTOL drones operating nominally.',
        is_read: false,
        created_at: new Date().toISOString(),
        type: 'system',
      },
      {
        id: 2,
        title: 'Zero Emission Milestone',
        message: 'CAMPUSNEX surpassed 1,200 km of emission-free deliveries.',
        is_read: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        type: 'eco',
      },
    ];
  }
  if (pathname === '/notifications/read-all') {
    return { message: 'All marked as read' };
  }

  // 9. Auth
  if (pathname === '/auth/login') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    let role = 'student';
    if (body.email?.includes('vendor')) role = 'vendor';
    if (body.email?.includes('admin')) role = 'admin';
    const user = MOCK_USERS[role] || MOCK_USERS.student;
    return { access_token: `mock_jwt_token_${role}`, user };
  }
  if (pathname === '/auth/register') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const user: User = {
      id: 99,
      name: body.name || 'New Campus User',
      email: body.email || 'user@campusnex.edu',
      role: body.role || 'student',
      campus_id: body.campus_id || 'STU-2026-NEW',
      hostel_block: body.hostel_block || 'Hostel Alpha',
      phone: body.phone || '+91 98765 00000',
      is_active: true,
      created_at: new Date().toISOString(),
    };
    return { access_token: 'mock_jwt_token_new', user };
  }
  if (pathname === '/auth/me') {
    const token = localStorage.getItem('campusnex_token') || '';
    if (token.includes('admin')) return MOCK_USERS.admin;
    if (token.includes('vendor')) return MOCK_USERS.vendor;
    return MOCK_USERS.student;
  }
  if (pathname === '/auth/demo-accounts') {
    return [
      { role: 'student', email: 'student@campusnex.edu', password: 'password123', label: 'Alex Chen (Student)' },
      { role: 'vendor', email: 'vendor@campusnex.edu', password: 'password123', label: 'Chef Marco (Cafeteria Vendor)' },
      { role: 'admin', email: 'admin@campusnex.edu', password: 'password123', label: 'Dispatch Center (Admin)' },
    ];
  }

  // 10. Orders
  if (pathname === '/orders' && method === 'GET') {
    return getStoredOrders();
  }
  if (pathname === '/orders/vendor') {
    return getStoredOrders();
  }
  if (pathname === '/orders' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const orders = getStoredOrders();
    const newId = Date.now();
    const isDrone = body.delivery_vehicle_type === 'drone' || (body.total_weight_kg && body.total_weight_kg < 1.0);
    const vehicleCode = isDrone ? 'DRONE-SD-01' : 'ROBOT-NX-01';
    const pickupNode =
      body.items?.[0]?.product_id > 7
        ? 'BIOLAB'
        : body.items?.[0]?.product_id > 3
        ? 'STATIONERY_HUB'
        : 'CAFETERIA';
    const dropoffNode = body.delivery_location_node || 'HOSTEL_A';

    const newOrder: Order = {
      id: newId,
      order_number: `ORD-NEX-${Math.floor(1000 + Math.random() * 9000)}`,
      student_id: 1,
      vendor_id: body.vendor_id || 1,
      status: 'assigned',
      priority: 'normal',
      delivery_location_name: body.delivery_address || 'Hostel Alpha',
      delivery_lat: 12.9734,
      delivery_lng: 77.5928,
      total_amount: body.total_amount || 250.0,
      delivery_fee: 0.0,
      total_weight_kg: body.total_weight_kg || 0.65,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: (body.items || []).map((it: any, idx: number) => ({
        id: idx + 1,
        product_id: it.product_id,
        product_name: MOCK_PRODUCTS.find((p) => p.id === it.product_id)?.name || 'Campus Item',
        quantity: it.quantity,
        unit_price: it.unit_price,
        subtotal: it.unit_price * it.quantity,
        unit_weight_kg: 0.25,
      })),
      assignment: {
        id: newId,
        order_id: newId,
        vehicle_id: isDrone ? 3 : 1,
        assigned_at: new Date().toISOString(),
        pickup_location_name: pickupNode,
        pickup_lat: 12.9712,
        pickup_lng: 77.594,
        destination_location_name: dropoffNode,
        destination_lat: 12.9734,
        destination_lng: 77.5928,
        estimated_distance_km: 0.72,
        estimated_duration_mins: 7.5,
        status: 'in_transit',
        current_step_index: 1,
        route_waypoints: [
          [12.9712, 77.594],
          [12.9719, 77.5932],
          [12.9734, 77.5928],
        ],
      },
    };
    orders.unshift(newOrder);
    saveStoredOrders(orders);
    return newOrder;
  }
  if (pathname.includes('/advance_simulation')) {
    const id = parseInt(pathname.split('/')[2]);
    const orders = getStoredOrders().map((o) => {
      if (o.id === id) {
        const nextStatus = (o.status === 'in_transit' ? 'delivered' : 'in_transit') as 'in_transit' | 'delivered';
        return { ...o, status: nextStatus };
      }
      return o;
    });
    saveStoredOrders(orders);
    return orders.find((o) => o.id === id);
  }
  if (pathname.includes('/confirm_delivery')) {
    const id = parseInt(pathname.split('/')[2]);
    const orders = getStoredOrders().map((o) => (o.id === id ? { ...o, status: 'delivered' as const } : o));
    saveStoredOrders(orders);
    return orders.find((o) => o.id === id);
  }
  if (pathname.includes('/cancel')) {
    const id = parseInt(pathname.split('/')[2]);
    const orders = getStoredOrders().map((o) => (o.id === id ? { ...o, status: 'cancelled' as const } : o));
    saveStoredOrders(orders);
    return orders.find((o) => o.id === id);
  }
  if (pathname.startsWith('/orders/')) {
    const id = parseInt(pathname.replace('/orders/', ''));
    return getStoredOrders().find((o) => o.id === id) || MOCK_ORDERS[0];
  }

  return null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // If backend is known to be offline (standalone demo mode on Vercel), return in-memory mock immediately with 0ms delay!
  if (isBackendOnline === false) {
    if (Date.now() - lastCheckTime > 60000) {
      probeBackend();
    }
    const fallback = handleMockFallback(endpoint, options);
    if (fallback !== null && fallback !== undefined) {
      return fallback as T;
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || contentType.includes('text/html')) {
      isBackendOnline = false;
      lastCheckTime = Date.now();
      throw new Error(`API returned ${res.status}`);
    }

    isBackendOnline = true;
    lastCheckTime = Date.now();
    return await res.json();
  } catch (err) {
    isBackendOnline = false;
    lastCheckTime = Date.now();
    const fallback = handleMockFallback(endpoint, options);
    if (fallback !== null && fallback !== undefined) {
      return fallback as T;
    }
    throw err;
  }
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(userData: any): Promise<{ access_token: string; user: User }> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async getMe(): Promise<User> {
    return request('/auth/me');
  },

  async getDemoAccounts(): Promise<any[]> {
    return request('/auth/demo-accounts');
  },

  // Products & Categories
  async getCategories(): Promise<Category[]> {
    return request('/products/categories');
  },

  async getProducts(params?: { category_slug?: string; vendor_id?: number; search?: string }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category_slug) query.set('category_slug', params.category_slug);
    if (params?.vendor_id) query.set('vendor_id', params.vendor_id.toString());
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/products${qs}`);
  },

  async getProduct(id: number): Promise<Product> {
    return request(`/products/${id}`);
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  async deleteProduct(id: number): Promise<{ message: string }> {
    return request(`/products/${id}`, { method: 'DELETE' });
  },

  // Orders
  async createOrder(orderData: any): Promise<Order> {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getUserOrders(): Promise<Order[]> {
    return request('/orders');
  },

  async getVendorOrders(): Promise<Order[]> {
    return request('/orders/vendor');
  },

  async getOrder(id: number): Promise<Order> {
    return request(`/orders/${id}`);
  },

  async updateVendorOrderStatus(id: number, status: string): Promise<Order> {
    return request(`/orders/${id}/vendor-status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async dispatchOrder(id: number): Promise<Order> {
    return request(`/orders/${id}/dispatch`, { method: 'POST' });
  },

  async advanceSimulation(id: number): Promise<Order> {
    return request(`/orders/${id}/advance_simulation`, { method: 'POST' });
  },

  async confirmDelivery(id: number): Promise<Order> {
    return request(`/orders/${id}/confirm_delivery`, { method: 'POST' });
  },

  async cancelOrder(id: number): Promise<Order> {
    return request(`/orders/${id}/cancel`, { method: 'POST' });
  },

  // Fleet & Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return request('/vehicles');
  },

  async getVehicle(id: number): Promise<Vehicle> {
    return request(`/vehicles/${id}`);
  },

  async updateVehicle(id: number, updateData: Partial<Vehicle>): Promise<Vehicle> {
    return request(`/vehicles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },

  async rechargeVehicle(id: number): Promise<Vehicle> {
    return request(`/vehicles/${id}/recharge`, { method: 'POST' });
  },

  // Logistics & Algorithms
  async getCampusNodes(): Promise<Record<string, CampusNode>> {
    return request('/logistics/campus-nodes');
  },

  async calculateRoute(data: {
    start_node: string;
    end_node: string;
    vehicle_type: string;
    algorithm: string;
  }): Promise<RouteSolverResult> {
    return request('/logistics/calculate-route', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // IoT Monitoring
  async getIoTTelemetry(): Promise<{
    status: string;
    broker_protocol: string;
    timestamp: string;
    total_active_nodes: number;
    telemetry: any[];
  }> {
    return request('/iot/telemetry-feed');
  },

  // Sustainability
  async getSustainabilityMetrics(): Promise<SustainabilityMetrics> {
    return request('/sustainability/metrics');
  },

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return request('/notifications');
  },

  async markAllNotificationsRead(): Promise<{ message: string }> {
    return request('/notifications/read-all', { method: 'POST' });
  },

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    return request('/vendors');
  },

  async getVendorMetrics(): Promise<any> {
    return request('/vendors/metrics');
  },
};
