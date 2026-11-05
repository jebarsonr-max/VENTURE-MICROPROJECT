import React from 'react';
import { Bot, Plane, BatteryCharging, Zap, Gauge, Navigation, ShieldCheck, RefreshCw } from 'lucide-react';
import { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onRecharge?: (id: number) => void;
  onSelect?: (vehicle: Vehicle) => void;
  isSelected?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onRecharge,
  onSelect,
  isSelected = false,
}) => {
  const isDrone = vehicle.vehicle_type === 'drone';
  const battery = vehicle.battery_percentage;

  let batteryColor = 'bg-campus-accent';
  let batteryTextColor = 'text-campus-accent';
  if (battery < 25) {
    batteryColor = 'bg-red-500';
    batteryTextColor = 'text-red-400';
  } else if (battery < 60) {
    batteryColor = 'bg-amber-400';
    batteryTextColor = 'text-amber-300';
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'idle':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">Idle / Ready</span>;
      case 'delivering':
      case 'in_transit':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800 animate-pulse">In Transit</span>;
      case 'en_route_pickup':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-950/80 text-purple-400 border border-purple-800">En Route Vendor</span>;
      case 'charging':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800">Recharging</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-campus-elevated text-campus-muted border border-campus-border">{status}</span>;
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(vehicle)}
      className={`p-4 rounded-2xl bg-campus-card border transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'border-campus-accent shadow-glow-accent bg-campus-elevated/40'
          : 'border-campus-border hover:border-campus-accent/50'
      }`}
    >
      {/* Header: Icon, Code & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            isDrone
              ? 'bg-campus-elevated border-campus-accent-subtle/50 text-campus-accent-subtle'
              : 'bg-campus-elevated border-campus-accent/50 text-campus-accent'
          }`}>
            {isDrone ? <Plane className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-campus-text">{vehicle.vehicle_code}</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-campus-elevated text-campus-muted">
                {isDrone ? 'UAV Flight' : 'UGV Ground'}
              </span>
            </div>
            <div className="text-xs text-campus-muted">{vehicle.model_name}</div>
          </div>
        </div>
        <div>{getStatusBadge(vehicle.status)}</div>
      </div>

      {/* Battery Gauge Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-campus-muted flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-campus-accent" />
            <span>Battery Reserve</span>
          </span>
          <span className={`font-mono font-bold ${batteryTextColor}`}>{battery.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-campus-bg h-2 rounded-full overflow-hidden border border-campus-border/50">
          <div
            className={`h-full ${batteryColor} transition-all duration-500`}
            style={{ width: `${Math.min(100, Math.max(0, battery))}%` }}
          />
        </div>
      </div>

      {/* Operational Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-campus-border/60 text-center">
        <div className="p-2 rounded-lg bg-campus-bg/50">
          <div className="text-[10px] text-campus-muted">Speed</div>
          <div className="text-xs font-mono font-bold text-campus-text">{vehicle.speed_kmh} km/h</div>
        </div>
        <div className="p-2 rounded-lg bg-campus-bg/50">
          <div className="text-[10px] text-campus-muted">Max Payload</div>
          <div className="text-xs font-mono font-bold text-campus-text">{vehicle.max_payload_kg} kg</div>
        </div>
        <div className="p-2 rounded-lg bg-campus-bg/50">
          <div className="text-[10px] text-campus-muted">Missions</div>
          <div className="text-xs font-mono font-bold text-campus-accent">{vehicle.total_deliveries} done</div>
        </div>
      </div>

      {/* Admin Actions */}
      {onRecharge && (
        <div className="mt-3 pt-2 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRecharge(vehicle.id);
            }}
            className="px-2.5 py-1 text-[11px] font-semibold text-campus-accent hover:bg-campus-elevated rounded-lg border border-campus-border flex items-center space-x-1 transition"
          >
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>Instant Recharge</span>
          </button>
        </div>
      )}
    </div>
  );
};

