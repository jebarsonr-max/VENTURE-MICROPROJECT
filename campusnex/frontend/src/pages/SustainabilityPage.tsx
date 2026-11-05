import React, { useState, useEffect } from 'react';
import {
  Leaf,
  Zap,
  TrendingUp,
  Droplets,
  Trees,
  Bot,
  Plane,
  ShieldCheck,
  BarChart2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { api } from '../services/api';
import { SustainabilityMetrics } from '../types';

export const SustainabilityPage: React.FC = () => {
  const [metrics, setMetrics] = useState<SustainabilityMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getSustainabilityMetrics()
      .then(setMetrics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Comparison data for Recharts: g CO2 per kilometer
  const emissionComparisonData = [
    { mode: 'Petrol Motorbike (125cc)', co2_g_km: 114.2, fill: '#EF4444' },
    { mode: 'Octocopter Drone (UAV)', co2_g_km: 32.0, fill: '#92D9A1' },
    { mode: 'Campus Ground Robot (UGV)', co2_g_km: 18.4, fill: '#B9F66B' },
  ];

  const cumulativeTrendData = [
    { month: 'Oct 2026', co2_avoided_kg: 18.2, deliveries: 42 },
    { month: 'Nov 2026', co2_avoided_kg: 42.5, deliveries: 88 },
    { month: 'Dec 2026', co2_avoided_kg: 74.0, deliveries: 120 },
    { month: 'Jan 2027', co2_avoided_kg: 115.8, deliveries: 164 },
    { month: 'Current', co2_avoided_kg: metrics?.estimated_co2_avoided_kg || 135.2, deliveries: metrics?.total_deliveries_completed || 192 },
  ];

  const fleetSplitData = [
    { name: 'Ground Robots (UGV)', value: metrics?.robot_delivery_pct || 68, color: '#B9F66B' },
    { name: 'Autonomous Drones (UAV)', value: metrics?.drone_delivery_pct || 32, color: '#92D9A1' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 text-xs font-bold text-campus-accent uppercase tracking-wider mb-1">
          <Leaf className="w-3.5 h-3.5" />
          <span>CO4: Sustainable Campus Transportation Impact</span>
        </div>
        <h1 className="text-3xl font-extrabold text-campus-text">Environmental Sustainability Analytics</h1>
        <p className="text-xs text-campus-muted mt-1">
          Measurable carbon abatement and fossil fuel displacement models across campus autonomous logistics.
        </p>
      </div>

      {/* Main KPI Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-campus-card border border-campus-border text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-campus-elevated border border-campus-border text-campus-accent flex items-center justify-center mx-auto">
            <Leaf className="w-5 h-5" />
          </div>
          <div className="text-xs text-campus-muted font-medium">Estimated CO₂ Avoided</div>
          <div className="text-3xl font-black text-campus-accent font-mono">
            {metrics?.estimated_co2_avoided_kg || '0.0'} kg
          </div>
          <div className="text-[10px] text-campus-muted">Zero tailpipe emissions</div>
        </div>

        <div className="p-6 rounded-3xl bg-campus-card border border-campus-border text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-campus-elevated border border-campus-border text-campus-accent-subtle flex items-center justify-center mx-auto">
            <Droplets className="w-5 h-5" />
          </div>
          <div className="text-xs text-campus-muted font-medium">Fossil Petrol Saved</div>
          <div className="text-3xl font-black text-campus-accent-subtle font-mono">
            {metrics?.petrol_litres_saved || '0.0'} L
          </div>
          <div className="text-[10px] text-campus-muted">Unburnt combustion fuel</div>
        </div>

        <div className="p-6 rounded-3xl bg-campus-card border border-campus-border text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-campus-elevated border border-campus-border text-white flex items-center justify-center mx-auto">
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-xs text-campus-muted font-medium">Solar Clean Energy</div>
          <div className="text-3xl font-black text-white font-mono">
            {metrics?.clean_kwh_consumed || '0.0'} kWh
          </div>
          <div className="text-[10px] text-campus-muted">Campus rooftop solar docks</div>
        </div>

        <div className="p-6 rounded-3xl bg-campus-card border border-campus-border text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-campus-elevated border border-campus-border text-emerald-400 flex items-center justify-center mx-auto">
            <Trees className="w-5 h-5" />
          </div>
          <div className="text-xs text-campus-muted font-medium">Tree Seedling Equivalent</div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {Math.round((metrics?.estimated_co2_avoided_kg || 15) / 21)} Trees
          </div>
          <div className="text-[10px] text-campus-muted">Annual sequestration balance</div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Carbon Abatement Comparison */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-campus-card border border-campus-border space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-campus-border">
            <div>
              <h3 className="font-extrabold text-sm text-campus-text">Emission Comparison (g CO₂ per km)</h3>
              <p className="text-xs text-campus-muted">Autonomous zero-emission fleets vs conventional motorbikes</p>
            </div>
            <span className="text-[10px] font-mono text-campus-accent">DEFRA Standard</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emissionComparisonData} layout="vertical" margin={{ left: 20, right: 30, top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C3B42" />
                <XAxis type="number" stroke="#9BA9AD" tick={{ fontSize: 11 }} />
                <YAxis dataKey="mode" type="category" stroke="#9BA9AD" tick={{ fontSize: 10 }} width={140} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#17232B', borderColor: '#2C3B42', borderRadius: '12px', fontSize: '11px', color: '#F5F7F4' }}
                />
                <Bar dataKey="co2_g_km" radius={[0, 8, 8, 0]}>
                  {emissionComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Modal Split Pie Chart */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-campus-card border border-campus-border space-y-4 shadow-xl">
          <div className="pb-2 border-b border-campus-border">
            <h3 className="font-extrabold text-sm text-campus-text">Fleet Modal Share</h3>
            <p className="text-xs text-campus-muted">Distribution of ground vs aerial deliveries</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fleetSplitData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {fleetSplitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#17232B', borderColor: '#2C3B42', borderRadius: '12px', fontSize: '11px', color: '#F5F7F4' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-campus-accent" />
              <span className="text-campus-text">Ground Robots ({metrics?.robot_delivery_pct || 68}%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-campus-accent-subtle" />
              <span className="text-campus-text">Drones ({metrics?.drone_delivery_pct || 32}%)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Methodology & Assumption Disclosure */}
      <div className="p-6 rounded-3xl bg-campus-card border border-campus-border space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-campus-accent">
          <ShieldCheck className="w-4 h-4" />
          <span>Transparent Mathematical Methodology & Academic Assumptions</span>
        </div>
        <p className="text-xs text-campus-muted leading-relaxed">
          {metrics?.calculation_basis || 'Calculations are computed deterministically based on fleet mileage logged in the database.'}
          {' '}Emissions are estimated using verified standards (114.2g CO₂/km for small motorbikes, 18.4g CO₂/km grid intensity for electric UGV, 32.0g CO₂/km for multirotor UAV). Real-world values are model estimates for demonstration.
        </p>
      </div>

    </div>
  );
};

