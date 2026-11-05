import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Bot,
  Plane,
  MapPin,
  Clock,
  BatteryCharging,
  Zap,
  Gauge,
  Activity,
  Play,
  FastForward,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { CampusMap } from '../components/CampusMap';
import { api } from '../services/api';
import { Order, Vehicle, CampusNode } from '../types';
import { useAuth } from '../context/AuthContext';

export const LiveTrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId');

  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [campusNodes, setCampusNodes] = useState<Record<string, CampusNode>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [advancing, setAdvancing] = useState<boolean>(false);

  const fetchTrackingData = async () => {
    try {
      const [allOrders, fleet, nodes] = await Promise.all([
        api.getUserOrders(),
        api.getVehicles(),
        api.getCampusNodes(),
      ]);
      setOrders(allOrders);
      setVehicles(fleet);
      setCampusNodes(nodes);

      // Select target order
      if (orderIdParam) {
        const found = allOrders.find((o) => o.id === parseInt(orderIdParam));
        if (found) setSelectedOrder(found);
      } else if (allOrders.length > 0) {
        // Find first active, or the most recent
        const active = allOrders.find((o) =>
          ['pending', 'vendor_accepted', 'preparing', 'ready_for_pickup', 'assigned', 'in_transit'].includes(o.status)
        );
        setSelectedOrder(active || allOrders[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
    const interval = setInterval(fetchTrackingData, 3000);
    return () => clearInterval(interval);
  }, [orderIdParam]);

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setSearchParams({ orderId: order.id.toString() });
  };

  const handleAdvanceSimulation = async () => {
    if (!selectedOrder) return;
    setAdvancing(true);
    try {
      const updated = await api.advanceSimulation(selectedOrder.id);
      setSelectedOrder(updated);
      fetchTrackingData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAdvancing(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!selectedOrder) return;
    try {
      const updated = await api.confirmDelivery(selectedOrder.id);
      setSelectedOrder(updated);
      fetchTrackingData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const assignedVehicle = selectedOrder?.assignment?.vehicle || null;
  const routeWaypoints = selectedOrder?.assignment?.route_waypoints || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-campus-accent uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-campus-accent animate-ping" />
            <span>Autonomous Grid Telemetry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-campus-text">Live Campus Tracking & Telemetry</h1>
          <p className="text-xs text-campus-muted mt-1">
            Real-time GPS tracking of ground delivery robots and octocopter drones with LiDAR telemetry.
          </p>
        </div>

        {/* Order Selector Dropdown */}
        {orders.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-campus-muted">Select Mission:</span>
            <select
              value={selectedOrder?.id || ''}
              onChange={(e) => {
                const ord = orders.find((o) => o.id === parseInt(e.target.value));
                if (ord) handleSelectOrder(ord);
              }}
              className="px-3 py-2 bg-campus-card border border-campus-border rounded-xl text-xs text-campus-text font-bold focus:outline-none focus:border-campus-accent"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.order_number} ({o.status.replace(/_/g, ' ')})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Grid: Interactive Map + Mission Command Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Leaflet Map Column */}
        <div className="lg:col-span-8 space-y-4">
          <CampusMap
            campusNodes={campusNodes}
            vehicles={vehicles}
            routeWaypoints={routeWaypoints}
            activeVehicle={assignedVehicle}
            height="560px"
          />

          {/* Interactive Presentation Controls Bar */}
          {selectedOrder && selectedOrder.status !== 'delivered' && selectedOrder.assignment && (
            <div className="p-4 rounded-2xl bg-campus-card border border-campus-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-campus-accent animate-pulse" />
                <span className="font-bold text-xs text-campus-text">Academic Presentation Simulator Controls:</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAdvanceSimulation}
                  disabled={advancing}
                  className="px-4 py-2 rounded-xl bg-campus-elevated border border-campus-accent text-campus-accent font-bold text-xs hover:bg-campus-accent hover:text-campus-bg transition flex items-center space-x-1.5 shadow-glow-accent"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{advancing ? 'Advancing...' : 'Advance 1 Waypoint'}</span>
                </button>

                <button
                  onClick={handleConfirmDelivery}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Arrival</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mission Status & IoT Telemetry Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {selectedOrder ? (
            <div className="p-6 rounded-3xl bg-campus-card border border-campus-border shadow-xl space-y-6">
              
              {/* Mission Header */}
              <div className="flex items-center justify-between pb-3 border-b border-campus-border">
                <div>
                  <div className="text-[10px] text-campus-muted uppercase font-mono">Mission Code</div>
                  <div className="font-extrabold text-base text-campus-text">{selectedOrder.order_number}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                  selectedOrder.status === 'delivered'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                    : 'bg-campus-elevated text-campus-accent border border-campus-border'
                }`}>
                  {selectedOrder.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Progress Milestones */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-campus-text">Mission Progression</div>
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Order Dispatched', done: true },
                    { label: 'Vendor Prepared Cargo', done: ['vendor_accepted', 'preparing', 'ready_for_pickup', 'assigned', 'in_transit', 'delivered'].includes(selectedOrder.status) },
                    { label: 'Autonomous Fleet Assigned', done: ['ready_for_pickup', 'assigned', 'in_transit', 'delivered'].includes(selectedOrder.status) },
                    { label: 'En Route to Customer Destination', done: ['in_transit', 'delivered'].includes(selectedOrder.status) },
                    { label: 'Arrived at Destination Point', done: selectedOrder.status === 'delivered' },
                  ].map((step, idx) => (
                    <div key={step.label} className="flex items-center space-x-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        step.done
                          ? 'bg-campus-accent text-campus-bg shadow-glow-accent'
                          : 'bg-campus-elevated text-campus-muted border border-campus-border'
                      }`}>
                        {step.done ? '✓' : idx + 1}
                      </div>
                      <span className={step.done ? 'text-campus-text font-medium' : 'text-campus-muted'}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned Vehicle IoT Specs */}
              {assignedVehicle ? (
                <div className="p-4 rounded-2xl bg-campus-elevated border border-campus-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {assignedVehicle.vehicle_type === 'drone' ? (
                        <Plane className="w-5 h-5 text-campus-accent-subtle" />
                      ) : (
                        <Bot className="w-5 h-5 text-campus-accent" />
                      )}
                      <div>
                        <div className="font-bold text-xs text-campus-text">{assignedVehicle.vehicle_code}</div>
                        <div className="text-[10px] text-campus-muted">{assignedVehicle.model_name}</div>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-campus-accent">
                      {assignedVehicle.battery_percentage.toFixed(1)}% Bat
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-campus-bg/60">
                      <div className="text-[10px] text-campus-muted">Current Speed</div>
                      <div className="font-mono font-bold text-campus-text">{assignedVehicle.speed_kmh} km/h</div>
                    </div>
                    <div className="p-2 rounded-lg bg-campus-bg/60">
                      <div className="text-[10px] text-campus-muted">Core Temperature</div>
                      <div className="font-mono font-bold text-campus-text">
                        {assignedVehicle.telemetry_data?.temp_c || 32.4}°C
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-campus-muted font-mono flex items-center justify-between pt-1">
                    <span>GPS: {assignedVehicle.current_lat.toFixed(5)}, {assignedVehicle.current_lng.toFixed(5)}</span>
                    <span className="text-emerald-400">RTK Lock</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-campus-elevated text-center text-xs text-campus-muted">
                  Awaiting vehicle assignment from logistics dispatcher...
                </div>
              )}

              {/* Waypoint distance & duration */}
              {selectedOrder.assignment && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-campus-muted">
                    <span>Estimated Route Distance:</span>
                    <span className="font-mono font-bold text-campus-text">
                      {selectedOrder.assignment.estimated_distance_km} km
                    </span>
                  </div>
                  <div className="flex justify-between text-campus-muted">
                    <span>Estimated Transit Duration:</span>
                    <span className="font-mono font-bold text-campus-accent">
                      ~{selectedOrder.assignment.estimated_duration_mins} mins
                    </span>
                  </div>
                  <div className="flex justify-between text-campus-muted">
                    <span>Pathfinding Algorithm:</span>
                    <span className="font-mono text-campus-text">
                      {selectedOrder.assignment.routing_algorithm || 'Dijkstra Shortest Path'}
                    </span>
                  </div>
                </div>
              )}

              {/* Rationale explanation */}
              {selectedOrder.assignment?.assignment_reason && (
                <div className="p-3 rounded-xl bg-campus-bg border border-campus-border text-[11px] text-campus-muted leading-relaxed">
                  <span className="font-semibold text-campus-accent">Dispatch Decision Log: </span>
                  {selectedOrder.assignment.assignment_reason}
                </div>
              )}

            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-campus-card border border-campus-border text-center text-xs text-campus-muted">
              Select or place an order to initiate live vehicle telemetry.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

