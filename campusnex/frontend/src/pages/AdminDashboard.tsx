import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  Bot,
  Plane,
  Users,
  Store,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  RefreshCw,
  Radio
} from 'lucide-react';
import { api } from '../services/api';
import { Order, Vehicle, SustainabilityMetrics } from '../types';

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [metrics, setMetrics] = useState<SustainabilityMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      const [ordList, fleet, sust] = await Promise.all([
        api.getUserOrders(),
        api.getVehicles(),
        api.getSustainabilityMetrics(),
      ]);
      setOrders(ordList);
      setVehicles(fleet);
      setMetrics(sust);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const idleVehicles = vehicles.filter((v) => v.status === 'idle');
  const activeVehicles = vehicles.filter((v) => v.status !== 'idle');
  const activeOrders = orders.filter((o) =>
    ['pending', 'vendor_accepted', 'preparing', 'ready_for_pickup', 'assigned', 'in_transit'].includes(o.status)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-campus-card border border-campus-border shadow-xl">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-campus-accent uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-campus-accent animate-ping" />
            <span>Campus Network Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-campus-text">Autonomous Fleet Operations</h1>
          <p className="text-xs text-campus-muted mt-1">
            Centrally monitor ground UGVs, octocopter UAVs, Dijkstra routing, and edge IoT telemetry.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/fleet"
            className="px-4 py-2.5 rounded-xl bg-campus-accent text-campus-bg font-extrabold text-xs hover:bg-campus-accent-subtle shadow-glow-accent transition flex items-center space-x-1.5"
          >
            <Bot className="w-4 h-4" />
            <span>Manage Fleet</span>
          </Link>
          <Link
            to="/logistics"
            className="px-4 py-2.5 rounded-xl bg-campus-card border border-campus-border text-campus-text font-bold text-xs hover:border-campus-accent transition flex items-center space-x-1.5"
          >
            <Layers className="w-4 h-4 text-campus-accent" />
            <span>Logistics Solver</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-campus-card border border-campus-border">
          <div className="flex items-center justify-between text-xs text-campus-muted">
            <span>Fleet Readiness</span>
            <Bot className="w-4 h-4 text-campus-accent" />
          </div>
          <div className="text-2xl font-black text-campus-accent font-mono mt-2">
            {idleVehicles.length}/{vehicles.length} Available
          </div>
          <div className="text-[10px] text-campus-muted mt-1">
            {activeVehicles.length} vehicles on mission
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-campus-card border border-campus-border">
          <div className="flex items-center justify-between text-xs text-campus-muted">
            <span>Active Missions</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-2">
            {activeOrders.length}
          </div>
          <div className="text-[10px] text-campus-muted mt-1">
            Orders currently in transit
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-campus-card border border-campus-border">
          <div className="flex items-center justify-between text-xs text-campus-muted">
            <span>Total Deliveries</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            {metrics?.total_deliveries_completed || 124}
          </div>
          <div className="text-[10px] text-campus-muted mt-1">
            Historical + active completions
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-campus-card border border-campus-border">
          <div className="flex items-center justify-between text-xs text-campus-muted">
            <span>CO₂ Avoided</span>
            <Zap className="w-4 h-4 text-campus-accent-subtle" />
          </div>
          <div className="text-2xl font-black text-campus-accent-subtle font-mono mt-2">
            {metrics?.estimated_co2_avoided_kg || '0.0'} kg
          </div>
          <div className="text-[10px] text-campus-muted mt-1">
            Zero combustion emissions
          </div>
        </div>
      </div>

      {/* Fleet Live Quick Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-campus-text uppercase tracking-wider">
            Active Fleet Telemetry ({vehicles.length} Vehicles)
          </h2>
          <Link to="/fleet" className="text-xs text-campus-accent hover:underline">
            Detailed Fleet Controls &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => {
            const isDrone = v.vehicle_type === 'drone';
            return (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-campus-card border border-campus-border space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isDrone ? (
                      <Plane className="w-4 h-4 text-campus-accent-subtle" />
                    ) : (
                      <Bot className="w-4 h-4 text-campus-accent" />
                    )}
                    <span className="font-bold text-xs text-campus-text">{v.vehicle_code}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                    v.status === 'idle'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800'
                  }`}>
                    {v.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-campus-muted">Battery:</span>
                  <span className="font-mono font-bold text-campus-accent">
                    {v.battery_percentage.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-campus-muted">Speed:</span>
                  <span className="font-mono text-campus-text">{v.speed_kmh} km/h</span>
                </div>

                <div className="text-[10px] font-mono text-campus-muted pt-2 border-t border-campus-border/60 flex justify-between">
                  <span>Deliveries: {v.total_deliveries}</span>
                  <span>Dist: {v.total_distance_km} km</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Order Log */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-campus-text uppercase tracking-wider">
          Recent Campus Network Missions ({orders.length})
        </h2>

        <div className="rounded-3xl bg-campus-card border border-campus-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-campus-border bg-campus-elevated/60 text-campus-muted uppercase font-mono text-[10px]">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Payload</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Tracking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-campus-border/60">
                {orders.slice(0, 8).map((o) => (
                  <tr key={o.id} className="hover:bg-campus-elevated/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-campus-text">{o.order_number}</td>
                    <td className="py-3 px-4 text-campus-muted">{o.student?.name || 'Alex Chen'}</td>
                    <td className="py-3 px-4 text-campus-text">{o.delivery_location_name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                        o.priority === 'urgent'
                          ? 'bg-red-950/80 text-red-400'
                          : o.priority === 'high'
                          ? 'bg-amber-950/80 text-amber-400'
                          : 'bg-campus-elevated text-campus-muted'
                      }`}>
                        {o.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-campus-accent">{o.total_weight_kg} kg</td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-campus-text">{o.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/tracking?orderId=${o.id}`}
                        className="text-campus-accent font-bold hover:underline"
                      >
                        Inspect &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

