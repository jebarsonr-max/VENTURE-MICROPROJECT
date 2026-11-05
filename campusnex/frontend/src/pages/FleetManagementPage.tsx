import React, { useState, useEffect } from 'react';
import {
  Bot,
  Plane,
  BatteryCharging,
  Zap,
  Gauge,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Power,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { Vehicle } from '../types';
import { VehicleCard } from '../components/VehicleCard';

export const FleetManagementPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFleet = async () => {
    try {
      const data = await api.getVehicles();
      setVehicles(data);
      if (!selectedVehicle && data.length > 0) {
        setSelectedVehicle(data[0]);
      } else if (selectedVehicle) {
        const updated = data.find((v) => v.id === selectedVehicle.id);
        if (updated) setSelectedVehicle(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
    const interval = setInterval(fetchFleet, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleRecharge = async (id: number) => {
    try {
      await api.rechargeVehicle(id);
      fetchFleet();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleMaintenance = async (vehicle: Vehicle) => {
    const nextStatus = vehicle.status === 'maintenance' ? 'idle' : 'maintenance';
    try {
      await api.updateVehicle(vehicle.id, { status: nextStatus });
      fetchFleet();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = vehicles.filter((v) => {
    if (filterType === 'all') return true;
    return v.vehicle_type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-campus-accent uppercase tracking-wider mb-1">
            <span>Fleet Management & Asset Health</span>
          </div>
          <h1 className="text-3xl font-extrabold text-campus-text">Autonomous Delivery Fleet</h1>
          <p className="text-xs text-campus-muted mt-1">
            Maintain, recharge, and inspect battery diagnostics for campus UGVs and UAVs.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center space-x-2 bg-campus-card p-1 rounded-xl border border-campus-border">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'all'
                ? 'bg-campus-elevated text-campus-accent border border-campus-border'
                : 'text-campus-muted hover:text-campus-text'
            }`}
          >
            All Fleet ({vehicles.length})
          </button>
          <button
            onClick={() => setFilterType('robot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
              filterType === 'robot'
                ? 'bg-campus-elevated text-campus-accent border border-campus-border'
                : 'text-campus-muted hover:text-campus-text'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Robots (UGV)</span>
          </button>
          <button
            onClick={() => setFilterType('drone')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
              filterType === 'drone'
                ? 'bg-campus-elevated text-campus-accent-subtle border border-campus-border'
                : 'text-campus-muted hover:text-campus-text'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Drones (UAV)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Vehicles list + Selected Vehicle Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Vehicles Cards List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                isSelected={selectedVehicle?.id === v.id}
                onSelect={(veh) => setSelectedVehicle(veh)}
                onRecharge={(id) => handleRecharge(id)}
              />
            ))}
          </div>
        </div>

        {/* Selected Vehicle Diagnostics Inspector */}
        <div className="lg:col-span-4">
          {selectedVehicle ? (
            <div className="p-6 rounded-3xl bg-campus-card border border-campus-border shadow-xl space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-campus-border">
                <div className="flex items-center space-x-2">
                  {selectedVehicle.vehicle_type === 'drone' ? (
                    <Plane className="w-5 h-5 text-campus-accent-subtle" />
                  ) : (
                    <Bot className="w-5 h-5 text-campus-accent" />
                  )}
                  <div>
                    <h3 className="font-extrabold text-sm text-campus-text">{selectedVehicle.vehicle_code}</h3>
                    <p className="text-[10px] text-campus-muted">{selectedVehicle.model_name}</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-campus-accent">
                  {selectedVehicle.battery_percentage.toFixed(1)}%
                </span>
              </div>

              {/* Maintenance & State Controls */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-campus-text">Operational Overrides</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleRecharge(selectedVehicle.id)}
                    className="p-2.5 rounded-xl bg-campus-elevated border border-campus-border hover:border-campus-accent text-campus-accent font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                  >
                    <BatteryCharging className="w-4 h-4" />
                    <span>Recharge 100%</span>
                  </button>

                  <button
                    onClick={() => handleToggleMaintenance(selectedVehicle)}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
                      selectedVehicle.status === 'maintenance'
                        ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                        : 'bg-campus-elevated border-campus-border hover:border-amber-400 text-amber-400'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>{selectedVehicle.status === 'maintenance' ? 'Restore Idle' : 'Maintenance'}</span>
                  </button>
                </div>
              </div>

              {/* Live Telemetry Data View */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-campus-text">Hardware Subsystems</div>
                <div className="p-3 rounded-2xl bg-campus-bg space-y-1.5 font-mono text-[11px] text-campus-muted">
                  <div className="flex justify-between">
                    <span>Motor Health:</span>
                    <span className="text-campus-accent">{selectedVehicle.telemetry_data?.motor_health || 99.4}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Core Temperature:</span>
                    <span className="text-campus-text">{selectedVehicle.telemetry_data?.temp_c || 28.5}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Signal Strength:</span>
                    <span className="text-campus-text">{selectedVehicle.telemetry_data?.network_signal_dbm || -62} dBm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heading Angle:</span>
                    <span className="text-campus-text">{selectedVehicle.telemetry_data?.heading_deg || 90}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payload Limit:</span>
                    <span className="text-campus-text">{selectedVehicle.max_payload_kg} kg</span>
                  </div>
                </div>
              </div>

              {/* Total Mileage */}
              <div className="p-3 rounded-2xl bg-campus-elevated border border-campus-border text-center">
                <div className="text-[10px] text-campus-muted">Cumulative Service Mileage</div>
                <div className="text-xl font-black text-campus-text font-mono mt-0.5">
                  {selectedVehicle.total_distance_km} km • {selectedVehicle.total_deliveries} missions
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-campus-card border border-campus-border text-center text-xs text-campus-muted">
              Select a vehicle to inspect hardware telemetry.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

