import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Clock,
  CheckCircle2,
  Package,
  TrendingUp,
  AlertCircle,
  Play,
  ArrowRight,
  Bot,
  Plane,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';

export const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchVendorData = async () => {
    try {
      const [ordList, met] = await Promise.all([
        api.getVendorOrders(),
        api.getVendorMetrics(),
      ]);
      setOrders(ordList);
      setMetrics(met);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
    const interval = setInterval(fetchVendorData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: number, nextStatus: string) => {
    try {
      await api.updateVendorOrderStatus(orderId, nextStatus);
      fetchVendorData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Vendor Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-campus-card border border-campus-border shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-campus-elevated border border-campus-accent/50 text-campus-accent flex items-center justify-center">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-campus-accent uppercase tracking-wider mb-0.5">
              <span>Vendor Operations Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-campus-text">
              {metrics?.store_name || "Campus Vendor Store"}
            </h1>
            <p className="text-xs text-campus-muted mt-0.5">
              Operating Partner: {user?.name || 'Chef Marco'} • Rating: ★ {metrics?.rating || 4.9}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/vendor/inventory"
            className="px-4 py-2.5 rounded-xl bg-campus-accent text-campus-bg font-extrabold text-xs hover:bg-campus-accent-subtle shadow-glow-accent transition flex items-center space-x-1.5"
          >
            <Package className="w-4 h-4" />
            <span>Manage Products & Stock</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-campus-card border border-campus-border">
          <div className="text-xs text-campus-muted">Total Revenue</div>
          <div className="text-2xl font-black text-campus-accent font-mono mt-1">
            ₹{metrics?.total_revenue?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[10px] text-campus-muted mt-1">Delivered orders</div>
        </div>

        <div className="p-5 rounded-2xl bg-campus-card border border-campus-border">
          <div className="text-xs text-campus-muted">Pending Acceptance</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {metrics?.pending_orders || 0}
          </div>
          <div className="text-[10px] text-campus-muted mt-1">Requires kitchen action</div>
        </div>

        <div className="p-5 rounded-2xl bg-campus-card border border-campus-border">
          <div className="text-xs text-campus-muted">In Transit / Ready</div>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
            {metrics?.in_transit_orders || 0}
          </div>
          <div className="text-[10px] text-campus-muted mt-1">Autonomous fleet moving</div>
        </div>

        <div className="p-5 rounded-2xl bg-campus-card border border-campus-border">
          <div className="text-xs text-campus-muted">Fulfilled Missions</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {metrics?.completed_orders || 0}
          </div>
          <div className="text-[10px] text-campus-muted mt-1">100% completed</div>
        </div>
      </div>

      {/* Live Orders Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-campus-text uppercase tracking-wider">
            Incoming Orders & Kitchen Queue ({orders.length})
          </h2>
          <span className="text-xs text-campus-muted">Auto-refresh active</span>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-campus-card border border-campus-border text-xs text-campus-muted">
            No incoming orders at the moment.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-campus-card border border-campus-border hover:border-campus-accent/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Order Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-campus-text">{order.order_number}</span>
                    <span className="text-campus-muted text-xs">•</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      order.priority === 'urgent'
                        ? 'bg-red-950/80 text-red-400 border border-red-800'
                        : order.priority === 'high'
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                        : 'bg-campus-elevated text-campus-muted border border-campus-border'
                    }`}>
                      {order.priority} Priority
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-campus-elevated text-campus-accent border border-campus-border capitalize">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-campus-muted">
                    Destination: <strong className="text-campus-text">{order.delivery_location_name}</strong> • Customer:{' '}
                    <strong className="text-campus-text">{order.student?.name || 'Campus Student'}</strong>
                  </div>

                  {/* Items list */}
                  <div className="pt-2 text-xs flex flex-wrap gap-2">
                    {order.items?.map((item) => (
                      <span
                        key={item.id}
                        className="px-2.5 py-1 rounded-lg bg-campus-elevated text-campus-text font-mono text-[11px] border border-campus-border/60"
                      >
                        {item.quantity}x {item.product_name} (₹{item.subtotal.toFixed(2)})
                      </span>
                    ))}
                  </div>

                  {order.delivery_notes && (
                    <div className="text-[11px] text-campus-muted italic">
                      Note: "{order.delivery_notes}"
                    </div>
                  )}
                </div>

                {/* Vendor Action Buttons based on order status */}
                <div className="flex flex-wrap items-center gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'vendor_accepted')}
                      className="px-4 py-2 rounded-xl bg-campus-accent text-campus-bg font-bold text-xs hover:bg-campus-accent-subtle shadow-glow-accent transition"
                    >
                      Accept Order
                    </button>
                  )}

                  {order.status === 'vendor_accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'preparing')}
                      className="px-4 py-2 rounded-xl bg-amber-400 text-campus-bg font-bold text-xs hover:bg-amber-300 transition"
                    >
                      Start Preparing
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'ready_for_pickup')}
                      className="px-4 py-2 rounded-xl bg-campus-accent text-campus-bg font-bold text-xs hover:bg-campus-accent-subtle shadow-glow-accent transition flex items-center space-x-1.5"
                    >
                      <Bot className="w-4 h-4" />
                      <span>Ready & Dispatch Fleet</span>
                    </button>
                  )}

                  {['ready_for_pickup', 'assigned', 'in_transit'].includes(order.status) && (
                    <Link
                      to={`/tracking?orderId=${order.id}`}
                      className="px-4 py-2 rounded-xl bg-campus-elevated border border-campus-border hover:border-campus-accent text-campus-accent font-bold text-xs transition flex items-center space-x-1.5"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Track Vehicle</span>
                    </Link>
                  )}

                  {order.status === 'delivered' && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Delivered Successfully</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

