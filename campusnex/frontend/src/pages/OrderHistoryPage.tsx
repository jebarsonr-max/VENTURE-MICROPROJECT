import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Bot,
  Plane,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
  }, []);

  const handleConfirmDelivery = async (id: number) => {
    try {
      await api.confirmDelivery(id);
      fetchOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.cancelOrder(id);
      fetchOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div>
        <h1 className="text-3xl font-extrabold text-campus-text">Your Campus Order History</h1>
        <p className="text-xs text-campus-muted mt-1">Review past and ongoing autonomous delivery missions.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-campus-card animate-pulse border border-campus-border" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-campus-card border border-campus-border space-y-3">
          <ShoppingBag className="w-12 h-12 text-campus-muted mx-auto opacity-50" />
          <h2 className="font-bold text-sm text-campus-text">No orders placed yet</h2>
          <p className="text-xs text-campus-muted">Order snacks, supplies, or lab items from our marketplace.</p>
          <Link
            to="/marketplace"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-campus-accent text-campus-bg font-extrabold text-xs shadow-glow-accent"
          >
            Start Ordering &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isCompleted = order.status === 'delivered';
            const isCancelled = order.status === 'cancelled';
            const isActive = !isCompleted && !isCancelled;

            return (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-campus-card border border-campus-border hover:border-campus-accent/40 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-campus-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-campus-elevated border border-campus-border flex items-center justify-center text-campus-accent">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-mono font-bold text-sm text-campus-text">{order.order_number}</div>
                      <div className="text-[10px] text-campus-muted">
                        Placed on {new Date(order.created_at).toLocaleString()} • Priority: <span className="uppercase text-campus-accent">{order.priority}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                      isCompleted
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : isCancelled
                        ? 'bg-red-950/80 text-red-400 border border-red-800'
                        : 'bg-campus-elevated text-campus-accent border border-campus-border animate-pulse'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono font-black text-base text-campus-text">
                      ₹{order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="text-xs flex flex-wrap gap-2">
                  {order.items?.map((item) => (
                    <span
                      key={item.id}
                      className="px-2.5 py-1 rounded-lg bg-campus-elevated text-campus-text border border-campus-border/60 text-[11px]"
                    >
                      {item.quantity}x {item.product_name}
                    </span>
                  ))}
                </div>

                {/* Destination & Action footer */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-campus-muted">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-campus-accent" />
                    <span>Dropoff: <strong className="text-campus-text">{order.delivery_location_name}</strong></span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isActive && (
                      <>
                        <button
                          onClick={() => handleCancel(order.id)}
                          className="px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-950/40 text-xs font-semibold"
                        >
                          Cancel Order
                        </button>
                        <button
                          onClick={() => handleConfirmDelivery(order.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500"
                        >
                          Confirm Received
                        </button>
                      </>
                    )}

                    <Link
                      to={`/tracking?orderId=${order.id}`}
                      className="px-4 py-1.5 rounded-lg bg-campus-elevated border border-campus-border hover:border-campus-accent text-campus-accent font-bold text-xs flex items-center space-x-1.5 transition"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Track Live Map' : 'View Mission Route'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

