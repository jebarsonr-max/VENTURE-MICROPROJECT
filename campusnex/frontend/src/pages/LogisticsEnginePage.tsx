import React, { useState, useEffect } from 'react';
import {
  Layers,
  Bot,
  Plane,
  Compass,
  Zap,
  Play,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { CampusNode, RouteSolverResult } from '../types';
import { CampusMap } from '../components/CampusMap';

export const LogisticsEnginePage: React.FC = () => {
  const [nodes, setNodes] = useState<Record<string, CampusNode>>({});
  const [startNode, setStartNode] = useState<string>('food_court');
  const [endNode, setEndNode] = useState<string>('hostel_alpha');
  const [vehicleType, setVehicleType] = useState<string>('robot');
  const [algorithm, setAlgorithm] = useState<string>('dijkstra');
  const [result, setResult] = useState<RouteSolverResult | null>(null);
  const [solving, setSolving] = useState<boolean>(false);

  useEffect(() => {
    api.getCampusNodes()
      .then((data) => {
        setNodes(data);
        // Run initial calculation
        api.calculateRoute({
          start_node: 'food_court',
          end_node: 'hostel_alpha',
          vehicle_type: 'robot',
          algorithm: 'dijkstra',
        }).then(setResult).catch(() => {});
      })
      .catch(() => {});
  }, []);

  const handleSolve = async () => {
    setSolving(true);
    try {
      const res = await api.calculateRoute({
        start_node: startNode,
        end_node: endNode,
        vehicle_type: vehicleType,
        algorithm: algorithm,
      });
      setResult(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSolving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 text-xs font-bold text-campus-accent uppercase tracking-wider mb-1">
          <span>CO3: Campus Mobility Graph Optimization</span>
        </div>
        <h1 className="text-3xl font-extrabold text-campus-text">Smart Logistics & Routing Engine</h1>
        <p className="text-xs text-campus-muted mt-1">
          Compare Dijkstra's Single-Source Shortest Path vs A* Heuristic Search and Drone Direct Aerial Corridors.
        </p>
      </div>

      {/* Control Panel Card */}
      <div className="p-6 rounded-3xl bg-campus-card border border-campus-border shadow-xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Start Facility */}
          <div>
            <label className="block text-xs font-semibold text-campus-muted mb-1.5">Origin Waypoint</label>
            <select
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
              className="w-full px-3 py-2.5 bg-campus-bg border border-campus-border rounded-xl text-xs text-campus-text font-bold focus:outline-none focus:border-campus-accent"
            >
              {Object.values(nodes).map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          {/* End Facility */}
          <div>
            <label className="block text-xs font-semibold text-campus-muted mb-1.5">Destination Waypoint</label>
            <select
              value={endNode}
              onChange={(e) => setEndNode(e.target.value)}
              className="w-full px-3 py-2.5 bg-campus-bg border border-campus-border rounded-xl text-xs text-campus-text font-bold focus:outline-none focus:border-campus-accent"
            >
              {Object.values(nodes).map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-xs font-semibold text-campus-muted mb-1.5">Fleet Vehicle Type</label>
            <select
              value={vehicleType}
              onChange={(e) => {
                setVehicleType(e.target.value);
                if (e.target.value === 'drone') setAlgorithm('corridor');
                else if (algorithm === 'corridor') setAlgorithm('dijkstra');
              }}
              className="w-full px-3 py-2.5 bg-campus-bg border border-campus-border rounded-xl text-xs text-campus-text font-bold focus:outline-none focus:border-campus-accent"
            >
              <option value="robot">Ground Robot (UGV Walkways)</option>
              <option value="drone">Autonomous Drone (UAV Air Corridor)</option>
            </select>
          </div>

          {/* Algorithm */}
          <div>
            <label className="block text-xs font-semibold text-campus-muted mb-1.5">Optimization Algorithm</label>
            <select
              value={algorithm}
              disabled={vehicleType === 'drone'}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full px-3 py-2.5 bg-campus-bg border border-campus-border rounded-xl text-xs text-campus-text font-bold focus:outline-none focus:border-campus-accent disabled:opacity-50"
            >
              {vehicleType === 'drone' ? (
                <option value="corridor">3D Direct Aerial Flight Corridor</option>
              ) : (
                <>
                  <option value="dijkstra">Dijkstra's Shortest Path</option>
                  <option value="astar">A* Heuristic Search (Haversine)</option>
                </>
              )}
            </select>
          </div>

        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSolve}
            disabled={solving}
            className="px-6 py-2.5 rounded-xl bg-campus-accent text-campus-bg font-extrabold text-xs hover:bg-campus-accent-subtle shadow-glow-accent transition flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>{solving ? 'Solving Path...' : 'Calculate Optimal Path'}</span>
          </button>
        </div>
      </div>

      {/* Visual Map & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Interactive Map Visualizing Route */}
        <div className="lg:col-span-7 space-y-4">
          <CampusMap
            campusNodes={nodes}
            routeWaypoints={result?.waypoints || []}
            height="500px"
          />
        </div>

        {/* Calculated Algorithmic Rationale & Log */}
        <div className="lg:col-span-5 space-y-6">
          {result && (
            <div className="p-6 rounded-3xl bg-campus-card border border-campus-border shadow-xl space-y-6">
              
              <div>
                <span className="text-[10px] font-mono font-bold text-campus-accent uppercase">
                  Algorithm Output • {result.algorithm}
                </span>
                <h3 className="font-extrabold text-lg text-campus-text mt-0.5">Optimal Solution Found</h3>
                <p className="text-xs text-campus-muted mt-1 leading-relaxed">{result.explanation}</p>
              </div>

              {/* Metrics cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-campus-elevated border border-campus-border text-center">
                  <div className="text-[10px] text-campus-muted uppercase font-mono">Total Traversal Distance</div>
                  <div className="text-xl font-black text-campus-accent font-mono mt-1">
                    {result.total_distance_km} km
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-campus-elevated border border-campus-border text-center">
                  <div className="text-[10px] text-campus-muted uppercase font-mono">Estimated Duration</div>
                  <div className="text-xl font-black text-campus-accent-subtle font-mono mt-1">
                    ~{result.estimated_duration_mins} mins
                  </div>
                </div>
              </div>

              {/* Sequence of Nodes Path */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-campus-text">Waypoint Graph Sequence</div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                  {result.path_nodes.map((n, idx) => (
                    <React.Fragment key={n}>
                      <span className="px-2 py-1 rounded bg-campus-elevated border border-campus-border text-campus-text">
                        {nodes[n]?.name || n}
                      </span>
                      {idx < result.path_nodes.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-campus-accent shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Exploration Trace */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-campus-text">State Space Exploration Trace</div>
                <div className="max-h-44 overflow-y-auto space-y-1.5 p-3 rounded-2xl bg-campus-bg font-mono text-[10px] text-campus-muted border border-campus-border scrollbar-thin">
                  {result.steps_log.map((step, idx) => (
                    <div key={idx} className="flex justify-between border-b border-campus-border/30 pb-1">
                      <span className="text-campus-text font-bold">
                        {step.node_name || step.event || `Step ${idx + 1}`}
                      </span>
                      <span className="text-campus-accent">
                        {step.cumulative_dist_km !== undefined
                          ? `dist: ${step.cumulative_dist_km}km`
                          : step.f_score_km !== undefined
                          ? `f(n)=${step.f_score_km}km`
                          : `${step.altitude_m || 45}m AGL`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};

