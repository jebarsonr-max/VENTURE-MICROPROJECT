import React, { useState, useEffect } from 'react';
import {
  Activity,
  Bot,
  Plane,
  Radio,
  Cpu,
  Zap,
  Gauge,
  Thermometer,
  Wifi,
  Compass,
  RefreshCw,
  Sliders,
  Server
} from 'lucide-react';
import { api } from '../services/api';

export const IoTMonitoringPage: React.FC = () => {
  const [telemetryData, setTelemetryData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchTelemetry = async () => {
    try {
      const res = await api.getIoTTelemetry();
      setTelemetryData(res);
      // Append sample log
      const timeStr = new Date().toLocaleTimeString();
      setLogs((prev) => [
        `[${timeStr}] MQTT TOPIC "campusnex/fleet/telemetry": Received frame for ${res.total_active_nodes} edge nodes.`,
        ...prev.slice(0, 19),
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    if (!autoRefresh) return;
    const interval = setInterval(fetchTelemetry, 2500);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Protocol Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-campus-accent uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-campus-accent animate-ping" />
            <span>Edge Sensor Telemetry Pipeline (CO1)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-campus-text">IoT Fleet Telemetry & Edge Sensors</h1>
          <p className="text-xs text-campus-muted mt-1">
            Real-time simulated telemetry for autonomous mobile robots and octocopter drones.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
              autoRefresh
                ? 'bg-campus-elevated border-campus-accent text-campus-accent'
                : 'bg-campus-card border-campus-border text-campus-muted'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>Auto-Stream {autoRefresh ? 'ON' : 'PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* Protocol Banner */}
      <div className="p-4 rounded-2xl bg-campus-card border border-campus-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-campus-muted">
          <Server className="w-4 h-4 text-campus-accent shrink-0" />
          <span>Broker Protocol: <strong className="text-campus-text font-mono">Simulated MQTT v5.0 (CoAP / WebSocket Bridge)</strong></span>
        </div>
        <div className="text-[11px] text-campus-muted font-mono bg-campus-elevated px-2.5 py-1 rounded-lg border border-campus-border">
          Active Nodes: <strong className="text-campus-accent">{telemetryData?.total_active_nodes || 5}</strong> • QoS: 1
        </div>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {telemetryData?.telemetry?.map((node: any) => {
          const isDrone = node.vehicle_type === 'drone';
          const isDelivering = node.status === 'delivering' || node.status === 'en_route_pickup';

          return (
            <div
              key={node.vehicle_id}
              className="p-6 rounded-3xl bg-campus-card border border-campus-border hover:border-campus-accent/50 transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isDrone
                      ? 'bg-campus-elevated border-campus-accent-subtle text-campus-accent-subtle'
                      : 'bg-campus-elevated border-campus-accent text-campus-accent'
                  }`}>
                    {isDrone ? <Plane className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-campus-text">{node.vehicle_code}</div>
                    <div className="text-[10px] text-campus-muted">{node.model_name}</div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                  isDelivering
                    ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800 animate-pulse'
                    : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                }`}>
                  {node.status}
                </span>
              </div>

              {/* Gauges Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {/* Battery */}
                <div className="p-3 rounded-2xl bg-campus-bg/70 border border-campus-border/60">
                  <div className="flex items-center justify-between text-[11px] text-campus-muted mb-1">
                    <span className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-campus-accent" />
                      <span>Battery</span>
                    </span>
                    <span className="font-mono font-bold text-campus-accent">{node.battery_percentage}%</span>
                  </div>
                  <div className="w-full bg-campus-elevated h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-campus-accent transition-all duration-500"
                      style={{ width: `${node.battery_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Core Temp */}
                <div className="p-3 rounded-2xl bg-campus-bg/70 border border-campus-border/60">
                  <div className="flex items-center justify-between text-[11px] text-campus-muted mb-1">
                    <span className="flex items-center space-x-1">
                      <Thermometer className="w-3 h-3 text-amber-400" />
                      <span>Temp</span>
                    </span>
                    <span className="font-mono font-bold text-campus-text">{node.sensors.core_temp_c}°C</span>
                  </div>
                  <div className="w-full bg-campus-elevated h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, (node.sensors.core_temp_c / 60) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sensor Telemetry List */}
              <div className="space-y-1.5 pt-2 border-t border-campus-border/60 text-xs">
                <div className="flex justify-between text-campus-muted">
                  <span className="flex items-center space-x-1">
                    <Gauge className="w-3.5 h-3.5" />
                    <span>Speed / Velocity:</span>
                  </span>
                  <span className="font-mono font-bold text-campus-text">{node.speed_kmh} km/h</span>
                </div>

                <div className="flex justify-between text-campus-muted">
                  <span className="flex items-center space-x-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Vibration Shock:</span>
                  </span>
                  <span className="font-mono font-bold text-campus-text">{node.sensors.vibration_g} g</span>
                </div>

                <div className="flex justify-between text-campus-muted">
                  <span className="flex items-center space-x-1">
                    <Wifi className="w-3.5 h-3.5" />
                    <span>Network Latency:</span>
                  </span>
                  <span className="font-mono font-bold text-campus-text">
                    {node.sensors.network_latency_ms} ms ({node.sensors.rssi_dbm} dBm)
                  </span>
                </div>

                <div className="flex justify-between text-campus-muted">
                  <span className="flex items-center space-x-1">
                    <Radio className="w-3.5 h-3.5" />
                    <span>GPS Satellites Locked:</span>
                  </span>
                  <span className="font-mono font-bold text-campus-accent">
                    {node.sensors.gps_satellites_locked} Locked (RTK)
                  </span>
                </div>

                <div className="flex justify-between text-campus-muted">
                  <span>LiDAR / Altitude:</span>
                  <span className="font-mono text-campus-accent-subtle text-[11px]">
                    {node.sensors.lidar_status}
                  </span>
                </div>
              </div>

              {/* GPS Coordinates */}
              <div className="p-2.5 rounded-xl bg-campus-bg text-[10px] font-mono text-campus-muted flex justify-between">
                <span>LAT: {node.lat}</span>
                <span>LNG: {node.lng}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time MQTT Frame Terminal */}
      <div className="p-6 rounded-3xl bg-campus-card border border-campus-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-campus-text">
            <Radio className="w-4 h-4 text-campus-accent" />
            <span>Simulated MQTT Packet Stream (Broker Console)</span>
          </div>
          <span className="text-[10px] font-mono text-campus-muted">JSON Telemetry Feed</span>
        </div>

        <div className="p-4 rounded-2xl bg-campus-bg font-mono text-[11px] text-campus-accent/90 h-44 overflow-y-auto space-y-1 scrollbar-thin">
          {logs.map((log, i) => (
            <div key={i} className="leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

