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

const API_URL = (((import.meta as any).env?.VITE_API_URL as string) || '').replace(/\/$/, '');
const API_BASE = `${API_URL}/api/v1`;

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('campusnex_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = 'API request failed';
    try {
      const errData = await res.json();
      errorDetail = errData.detail || errData.message || JSON.stringify(errData);
    } catch {
      errorDetail = `Status code ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return res.json();
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

