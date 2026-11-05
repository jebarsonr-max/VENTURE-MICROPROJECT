import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Bot,
  Plane,
  Zap,
  ShieldCheck,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CampusNode } from '../types';
import { SafeImage } from '../components/SafeImage';

export const CheckoutPage: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalWeightKg, totalCount, vendorId } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [campusNodes, setCampusNodes] = useState<Record<string, CampusNode>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string>('hostel_alpha');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [notes, setNotes] = useState<string>('Room 304, North Wing. Leave at designated robot locker.');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getCampusNodes()
      .then((nodes) => {
        setCampusNodes(nodes);
        if (nodes['hostel_alpha']) setSelectedNodeId('hostel_alpha');
      })
      .catch(() => {});
  }, []);

  const deliveryFee = priority === 'normal' ? 15.0 : priority === 'high' ? 25.0 : 40.0;
  const grandTotal = totalPrice + deliveryFee;

  const isDroneEligible = totalWeightKg <= 4.0;

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (items.length === 0 || !vendorId) {
      setError('Your shopping cart is empty.');
      return;
    }

    const selectedNode = campusNodes[selectedNodeId];
    if (!selectedNode) {
      setError('Please select a valid campus delivery location.');
      return;
    }

    if (priority === 'urgent' && !isDroneEligible) {
      setError(`Urgent Drone Delivery cannot exceed 4.0 kg payload (Current: ${totalWeightKg.toFixed(2)} kg). Please switch to Ground Robot or remove heavy items.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        vendor_id: vendorId,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
        delivery_location_name: selectedNode.name,
        delivery_lat: selectedNode.lat,
        delivery_lng: selectedNode.lng,
        delivery_notes: notes,
        priority: priority,
      };

      const created = await api.createOrder(orderPayload);
      clearCart();
      navigate(`/tracking?orderId=${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-campus-card border border-campus-border text-campus-accent flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 opacity-60" />
        </div>
        <h2 className="text-2xl font-extrabold text-campus-text">Your cart is currently empty</h2>
        <p className="text-xs text-campus-muted mt-2 max-w-sm mx-auto">
          Browse our campus marketplace to add fresh cafeteria foods, stationery, lab reagents, or textbooks.
        </p>
        <Link
          to="/marketplace"
          className="inline-flex items-center space-x-2 mt-6 px-6 py-3 rounded-xl bg-campus-accent text-campus-bg font-extrabold text-xs hover:bg-campus-accent-subtle shadow-glow-accent transition"
        >
          <span>Explore Campus Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-campus-text">Checkout & Autonomous Dispatch</h1>
        <p className="text-xs text-campus-muted mt-1">Configure campus delivery destination, priority, and payload assignment.</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Cart Items & Destination Configuration */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Order Items Review */}
          <div className="p-6 rounded-3xl bg-campus-card border border-campus-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-campus-border">
              <h2 className="font-bold text-sm text-campus-text">Order Items ({totalCount})</h2>
              <button
                onClick={clearCart}
                className="text-xs text-red-400 hover:underline flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="divide-y divide-campus-border/60">
              {items.map((item) => (
                <div key={item.product.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <SafeImage
                      src={item.product.image_url}
                      alt={item.product.name}
                      fallbackSrc="/images/food/avocado_panini.jpg"
                      containerClassName="w-12 h-12 rounded-xl shrink-0"
                      className="w-12 h-12 rounded-xl object-cover bg-campus-elevated"
                    />
                    <div>
                      <div className="font-bold text-xs text-campus-text line-clamp-1">{item.product.name}</div>
                      <div className="text-[10px] text-campus-muted">
                        ₹{item.product.price.toFixed(2)} • {item.product.weight_kg} kg each
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-campus-border rounded-lg bg-campus-bg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 hover:text-campus-accent text-campus-muted"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-campus-text">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:text-campus-accent text-campus-muted"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right w-16">
                      <div className="font-mono font-bold text-xs text-campus-text">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Destination */}
          <div className="p-6 rounded-3xl bg-campus-card border border-campus-border space-y-4">
            <h2 className="font-bold text-sm text-campus-text flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-campus-accent" />
              <span>Campus Delivery Destination</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-campus-muted mb-1.5">Select Campus Facility Node</label>
              <select
                value={selectedNodeId}
                onChange={(e) => setSelectedNodeId(e.target.value)}
                className="w-full px-3 py-2.5 bg-campus-bg border border-campus-border rounded-xl text-xs text-campus-text focus:outline-none focus:border-campus-accent font-semibold"
              >
                {Object.values(campusNodes).map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} ({node.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-campus-muted mb-1.5">Delivery Notes & Precision Drop Point</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Room 304 North Wing, Contact upon autonomous arrival"
                className="w-full px-3 py-2.5 bg-campus-bg border border-campus-border rounded-xl text-xs text-campus-text focus:outline-none focus:border-campus-accent"
              />
            </div>
          </div>

          {/* Priority & Vehicle Mode */}
          <div className="p-6 rounded-3xl bg-campus-card border border-campus-border space-y-4">
            <h2 className="font-bold text-sm text-campus-text flex items-center space-x-2">
              <Zap className="w-4 h-4 text-campus-accent" />
              <span>Delivery Priority & Fleet Mode</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Normal */}
              <div
                onClick={() => setPriority('normal')}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  priority === 'normal'
                    ? 'border-campus-accent bg-campus-elevated shadow-glow-accent/20'
                    : 'border-campus-border hover:border-campus-border/80 bg-campus-bg'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Bot className="w-5 h-5 text-campus-accent" />
                  <span className="font-mono text-xs font-bold text-campus-text">₹15</span>
                </div>
                <div className="font-bold text-xs text-campus-text">Normal (Robot)</div>
                <div className="text-[10px] text-campus-muted mt-1">Ground UGV • 10-14 mins</div>
              </div>

              {/* High */}
              <div
                onClick={() => setPriority('high')}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  priority === 'high'
                    ? 'border-campus-accent bg-campus-elevated shadow-glow-accent/20'
                    : 'border-campus-border hover:border-campus-border/80 bg-campus-bg'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Bot className="w-5 h-5 text-amber-400" />
                  <span className="font-mono text-xs font-bold text-campus-text">₹25</span>
                </div>
                <div className="font-bold text-xs text-campus-text">High Priority</div>
                <div className="text-[10px] text-campus-muted mt-1">Priority queue • 7-10 mins</div>
              </div>

              {/* Urgent Drone */}
              <div
                onClick={() => {
                  if (!isDroneEligible) {
                    alert('Order exceeds 4.0 kg payload capacity. Drones cannot carry heavy loads.');
                    return;
                  }
                  setPriority('urgent');
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  priority === 'urgent'
                    ? 'border-campus-accent bg-campus-elevated shadow-glow-accent/20'
                    : 'border-campus-border hover:border-campus-border/80 bg-campus-bg'
                } ${!isDroneEligible ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Plane className="w-5 h-5 text-campus-accent-subtle" />
                  <span className="font-mono text-xs font-bold text-campus-text">₹40</span>
                </div>
                <div className="font-bold text-xs text-campus-text">Urgent Drone</div>
                <div className="text-[10px] text-campus-muted mt-1">Aerial 45km/h • 3-5 mins</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Payload & Financial Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-campus-card border border-campus-border shadow-xl space-y-6">
            <h2 className="font-extrabold text-base text-campus-text pb-3 border-b border-campus-border">
              Dispatch Mission Summary
            </h2>

            {/* Payload verification box */}
            <div className="p-4 rounded-2xl bg-campus-elevated border border-campus-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-campus-muted">Combined Payload Weight:</span>
                <span className="font-mono font-bold text-campus-accent">{totalWeightKg.toFixed(2)} kg</span>
              </div>
              <div className="w-full bg-campus-bg h-2 rounded-full overflow-hidden border border-campus-border">
                <div
                  className={`h-full ${totalWeightKg > 4.0 ? 'bg-amber-400' : 'bg-campus-accent'}`}
                  style={{ width: `${Math.min(100, (totalWeightKg / 25.0) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-campus-muted flex items-center justify-between">
                <span>Drone limit: 4.0 kg</span>
                <span>Robot capacity: 25.0 kg</span>
              </div>
            </div>

            {/* Financial breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-campus-muted">
                <span>Subtotal ({totalCount} items)</span>
                <span className="font-mono text-campus-text">₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-campus-muted">
                <span>Autonomous Mobility Fee</span>
                <span className="font-mono text-campus-text">₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-campus-muted">
                <span>Campus Green Energy Rebate</span>
                <span className="font-mono text-campus-accent">-₹0.00 (Zero Carbon)</span>
              </div>
              <div className="pt-3 border-t border-campus-border flex justify-between items-center text-sm">
                <span className="font-bold text-campus-text">Total Payable</span>
                <span className="font-extrabold text-lg text-campus-accent font-mono">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-campus-accent text-campus-bg font-extrabold text-sm hover:bg-campus-accent-subtle shadow-glow-accent transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Dispatching Fleet...' : 'Confirm Order & Dispatch Fleet'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[10px] text-campus-muted text-center flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-campus-accent" />
              <span>Simulated Campus Payment & Autonomous Passcode Handover</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
