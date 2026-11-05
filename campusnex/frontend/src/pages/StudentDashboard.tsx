import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bot,
  Plane,
  ShoppingBag,
  MapPin,
  Clock,
  ArrowRight,
  Utensils,
  PenTool,
  FlaskConical,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order } from '../types';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await api.getUserOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeOrder = orders.find((o) =>
    ['pending', 'vendor_accepted', 'preparing', 'ready_for_pickup', 'assigned', 'in_transit'].includes(o.status)
  );

  const completedOrders = orders.filter((o) => o.status === 'delivered');

  const handleAdvanceSimulation = async (orderId: number) => {
    try {
      await api.advanceSimulation(orderId);
      fetchOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-campus-card via-campus-elevated to-campus-card border border-campus-border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-campus-bg/80 border border-campus-border text-xs text-campus-accent mb-2">
            <span className="w-2 h-2 rounded-full bg-campus-accent animate-ping" />
            <span>Student Portal Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-campus-text">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-campus-muted mt-1">
            Hostel Location: <strong className="text-campus-text">{user?.hostel_block || 'Hostel Alpha'}</strong> • ID: {user?.campus_id || 'STU-2026-8812'}
          </p>
        </div>

        {/* Quick Order Button */}
        <div className="flex flex-wrap gap-3">
          <Link
            to="/marketplace"
            className="px-5 py-2.5 rounded-xl bg-campus-accent text-campus-bg font-extrabold text-xs hover:bg-campus-accent-subtle shadow-glow-accent transition flex items-center space-x-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>New Order</span>
          </Link>
          <Link
            to="/tracking"
            className="px-5 py-2.5 rounded-xl bg-campus-card border border-campus-border hover:border-campus-accent text-campus-text font-bold text-xs transition flex items-center space-x-2"
          >
            <MapPin className="w-4 h-4 text-campus-accent" />
            <span>Track Deliveries</span>
          </Link>
        </div>
      </div>

      {/* ACTIVE ORDER LIVE CARD */}
      {activeOrder ? (
        <div className="p-6 rounded-3xl bg-campus-card border-2 border-campus-accent/80 shadow-glow-accent/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-campus-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-campus-elevated border border-campus-accent flex items-center justify-center text-campus-accent animate-pulse">
                {activeOrder.assignment?.vehicle?.vehicle_type === 'drone' ? (
                  <Plane className="w-6 h-6" />
                ) : (
                  <Bot className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-campus-accent">ACTIVE MISSION</span>
                  <span className="text-xs text-campus-muted">•</span>
                  <span className="font-bold text-sm text-campus-text">{activeOrder.order_number}</span>
                </div>
                <div className="text-xs text-campus-muted">
                  From: {activeOrder.vendor?.store_name || 'Campus Vendor'} &rarr; Destination: {activeOrder.delivery_location_name}
                </div>
              </div>
            </div>

            {/* Quick Actions for active order */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleAdvanceSimulation(activeOrder.id)}
                className="px-3 py-1.5 rounded-lg bg-campus-elevated border border-campus-border hover:border-campus-accent text-xs font-semibold text-campus-text flex items-center space-x-1.5 transition"
                title="Advance vehicle along waypoints by 1 step for presentation demonstration"
              >
                <Play className="w-3.5 h-3.5 text-campus-accent" />
                <span>Simulate Step</span>
              </button>

              <Link
                to={`/tracking?orderId=${activeOrder.id}`}
                className="px-4 py-1.5 rounded-lg bg-campus-accent text-campus-bg font-bold text-xs hover:bg-campus-accent-subtle shadow-glow-accent transition flex items-center space-x-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Live Map Track</span>
              </Link>
            </div>
          </div>

          {/* Status Tracker Bar */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-campus-text capitalize">
                Status: <strong className="text-campus-accent">{activeOrder.status.replace(/_/g, ' ')}</strong>
              </span>
              <span className="text-campus-muted font-mono">
                {activeOrder.assignment?.vehicle ? (
                  `${activeOrder.assignment.vehicle.vehicle_code} (${activeOrder.assignment.vehicle.battery_percentage.toFixed(0)}% Battery)`
                ) : (
                  'Matching fleet vehicle...'
                )}
              </span>
            </div>

            <div className="w-full bg-campus-bg h-2.5 rounded-full overflow-hidden border border-campus-border">
              <div
                className="h-full bg-campus-accent transition-all duration-700 shadow-glow-accent"
                style={{
                  width:
                    activeOrder.status === 'pending'
                      ? '15%'
                      : activeOrder.status === 'vendor_accepted' || activeOrder.status === 'preparing'
                      ? '40%'
                      : activeOrder.status === 'ready_for_pickup' || activeOrder.status === 'assigned'
                      ? '65%'
                      : '85%',
                }}
              />
            </div>
          </div>

          {/* Algorithmic Reason */}
          {activeOrder.assignment?.assignment_reason && (
            <div className="p-3 rounded-xl bg-campus-elevated/70 border border-campus-border text-[11px] text-campus-muted">
              <span className="font-semibold text-campus-accent">Autonomous Dispatch Rationale: </span>
              {activeOrder.assignment.assignment_reason}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-campus-card border border-campus-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-campus-elevated border border-campus-border flex items-center justify-center text-campus-muted">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-campus-text">No active delivery in progress</div>
              <div className="text-xs text-campus-muted">Order something fresh or essential to dispatch a robot right away!</div>
            </div>
          </div>
          <Link
            to="/marketplace"
            className="px-4 py-2 rounded-xl bg-campus-accent text-campus-bg font-bold text-xs hover:bg-campus-accent-subtle shadow-glow-accent transition"
          >
            Order Now &rarr;
          </Link>
        </div>
      )}

      {/* QUICK CATEGORY SHORTCUTS */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-campus-muted mb-3">Quick Order Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/marketplace?category=food-beverages"
            className="p-4 rounded-2xl bg-campus-card border border-campus-border hover:border-campus-accent transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-campus-elevated border border-campus-border flex items-center justify-center text-campus-accent mb-2 group-hover:scale-110 transition">
              <Utensils className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-campus-text group-hover:text-campus-accent">Food & Cafeteria</div>
            <div className="text-[10px] text-campus-muted mt-0.5">Sandwiches, Bowls, Cold Brew</div>
          </Link>

          <Link
            to="/marketplace?category=stationery"
            className="p-4 rounded-2xl bg-campus-card border border-campus-border hover:border-campus-accent transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-campus-elevated border border-campus-border flex items-center justify-center text-campus-accent mb-2 group-hover:scale-110 transition">
              <PenTool className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-campus-text group-hover:text-campus-accent">Stationery & Draft</div>
            <div className="text-[10px] text-campus-muted mt-0.5">Pens, Journals, Calculators</div>
          </Link>

          <Link
            to="/marketplace?category=lab-essentials"
            className="p-4 rounded-2xl bg-campus-card border border-campus-border hover:border-campus-accent transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-campus-elevated border border-campus-border flex items-center justify-center text-campus-accent mb-2 group-hover:scale-110 transition">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-campus-text group-hover:text-campus-accent">Lab Essentials</div>
            <div className="text-[10px] text-campus-muted mt-0.5">Pipettes, Nitrile, Goggles</div>
          </Link>

          <Link
            to="/marketplace?category=books"
            className="p-4 rounded-2xl bg-campus-card border border-campus-border hover:border-campus-accent transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-campus-elevated border border-campus-border flex items-center justify-center text-campus-accent mb-2 group-hover:scale-110 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-campus-text group-hover:text-campus-accent">Course Books</div>
            <div className="text-[10px] text-campus-muted mt-0.5">Algorithm & Hardware Texts</div>
          </Link>
        </div>
      </div>

      {/* METRICS & RECENT ORDERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Deliveries */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-campus-muted">Recent Campus Orders</h2>
            <Link to="/orders" className="text-xs font-bold text-campus-accent hover:underline">
              View All Orders &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-campus-card border border-campus-border text-center text-xs text-campus-muted">
                No previous orders found.
              </div>
            ) : (
              orders.slice(0, 5).map((o) => (
                <div
                  key={o.id}
                  className="p-4 rounded-2xl bg-campus-card border border-campus-border hover:border-campus-border/80 transition flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-campus-elevated border border-campus-border flex items-center justify-center text-campus-accent">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-campus-text">{o.order_number}</div>
                      <div className="text-[10px] text-campus-muted">
                        {o.items?.length || 1} items • ₹{o.total_amount.toFixed(2)} • {new Date(o.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                      o.status === 'delivered'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : 'bg-campus-elevated text-campus-accent border border-campus-border'
                    }`}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                    <Link
                      to={`/tracking?orderId=${o.id}`}
                      className="p-1.5 rounded-lg bg-campus-elevated border border-campus-border text-campus-muted hover:text-campus-accent transition"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Student Impact Summary */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-campus-muted">Personal Campus Impact</h2>
          <div className="p-6 rounded-3xl bg-campus-card border border-campus-border space-y-4">
            <div>
              <div className="text-[11px] text-campus-muted">Completed Robot Deliveries</div>
              <div className="text-2xl font-black text-campus-accent font-mono">{completedOrders.length}</div>
            </div>
            <div className="pt-3 border-t border-campus-border/60">
              <div className="text-[11px] text-campus-muted">Estimated CO₂ Avoided</div>
              <div className="text-2xl font-black text-campus-accent-subtle font-mono">
                {(completedOrders.length * 0.12).toFixed(2)} kg
              </div>
            </div>
            <div className="pt-3 border-t border-campus-border/60">
              <div className="text-[11px] text-campus-muted">Delivery Time Saved</div>
              <div className="text-2xl font-black text-white font-mono">
                {completedOrders.length * 18} mins
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

