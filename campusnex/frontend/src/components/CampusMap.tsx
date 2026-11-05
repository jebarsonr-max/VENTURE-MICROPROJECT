import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Vehicle, CampusNode } from '../types';
import { MOCK_CAMPUS_NODES, MOCK_VEHICLES } from '../services/mockData';

// Fix Leaflet marker asset lookup
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom high-contrast badges for campus facility nodes
const createBuildingIcon = (type: string, name: string, isSelected: boolean = false) => {
  let borderColor = '#2C3B42';
  let badgeIcon = '🏢';
  let bg = '#17232B';

  if (type === 'vendor') {
    borderColor = '#F59E0B';
    badgeIcon = '🍽️';
  } else if (type === 'lab') {
    borderColor = '#EF4444';
    badgeIcon = '🔬';
  } else if (type === 'residential') {
    borderColor = '#3B82F6';
    badgeIcon = '🛌';
  } else if (type === 'infrastructure') {
    borderColor = '#B9F66B';
    badgeIcon = '🛸';
  } else if (type === 'academic') {
    borderColor = '#8B5CF6';
    badgeIcon = '📚';
  } else if (type === 'recreation') {
    borderColor = '#10B981';
    badgeIcon = '🏟️';
  }

  if (isSelected) {
    borderColor = '#B9F66B';
    bg = '#202F38';
  }

  return L.divIcon({
    className: 'custom-building-pin',
    html: `
      <div style="
        background: ${bg};
        border: 2px solid ${borderColor};
        color: #F5F7F4;
        border-radius: 10px;
        padding: 4px 8px;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.7);
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
        cursor: pointer;
        transition: transform 0.2s;
        ${isSelected ? 'box-shadow: 0 0 16px rgba(185, 246, 107, 0.4); transform: scale(1.08);' : ''}
      ">
        <span style="font-size: 13px;">${badgeIcon}</span>
        <span style="letter-spacing: -0.2px;">${name}</span>
      </div>
    `,
    iconSize: [130, 30],
    iconAnchor: [65, 15],
  });
};

// Custom interactive icon for autonomous delivery robots & drones
const createVehicleIcon = (vehicleType: 'robot' | 'drone', code: string, status: string, battery: number) => {
  const isDrone = vehicleType === 'drone';
  const accent = isDrone ? '#92D9A1' : '#B9F66B';
  const iconEmoji = isDrone ? '🚁' : '🤖';

  const isMoving = ['delivering', 'en_route_pickup', 'in_transit'].includes(status);

  return L.divIcon({
    className: 'custom-vehicle-pin',
    html: `
      <div style="
        background: #101820;
        border: 2px solid ${accent};
        color: #F5F7F4;
        border-radius: 22px;
        padding: 4px 10px;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 0 18px ${accent}77;
        font-size: 11px;
        font-weight: 800;
        cursor: pointer;
        ${isMoving ? 'animation: pulse 1.8s infinite;' : ''}
      ">
        <span style="font-size: 15px;">${iconEmoji}</span>
        <div>
          <div style="color: ${accent}; font-family: monospace; font-size: 11px; line-height: 1;">${code}</div>
          <div style="font-size: 8px; color: #9BA9AD; margin-top: 1px;">${battery.toFixed(0)}% • ${status}</div>
        </div>
      </div>
    `,
    iconSize: [135, 36],
    iconAnchor: [67, 18],
  });
};

interface CampusMapProps {
  campusNodes?: Record<string, CampusNode>;
  vehicles?: Vehicle[];
  routeWaypoints?: [number, number][];
  activeVehicle?: Vehicle | null;
  selectedDestination?: string | null;
  onSelectNode?: (nodeId: string, node: CampusNode) => void;
  height?: string;
}

// Controller to smoothly pan when active vehicle moves
const MapCenterController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo(center, { animate: true, duration: 1.0 });
  }, [center, map]);
  return null;
};

export const CampusMap: React.FC<CampusMapProps> = ({
  campusNodes = {},
  vehicles = [],
  routeWaypoints = [],
  activeVehicle = null,
  selectedDestination = null,
  onSelectNode,
  height = '520px',
}) => {
  const effectiveNodes = Object.keys(campusNodes).length > 0 ? campusNodes : MOCK_CAMPUS_NODES;
  const effectiveVehicles = vehicles.length > 0 ? vehicles : MOCK_VEHICLES;
  const effectiveRouteWaypoints: [number, number][] = routeWaypoints.length > 0
    ? routeWaypoints
    : [
        [12.97120, 77.59400],
        [12.97190, 77.59320],
        [12.97340, 77.59280],
      ];

  // Center: Tech University Campus Center [12.9720, 77.5945]
  const centerPosition: [number, number] = activeVehicle
    ? [activeVehicle.current_lat, activeVehicle.current_lng]
    : [12.9720, 77.5945];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-campus-border shadow-2xl" style={{ height }}>
      
      {/* Top Map HUD Overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-campus-card/95 backdrop-blur-md border border-campus-border rounded-2xl p-3.5 text-xs shadow-2xl pointer-events-none max-w-xs">
        <div className="font-extrabold text-campus-accent flex items-center space-x-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-campus-accent animate-ping" />
          <span className="tracking-wider">CAMPUS GEOSPATIAL NETWORK</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-campus-muted">
          <div>🤖 NexusRover UGVs</div>
          <div>🚁 SkyDart UAVs</div>
          <div>🍽️ Cafeteria Hub</div>
          <div>🛌 Student Residencies</div>
        </div>
        <div className="mt-2 pt-2 border-t border-campus-border/60 text-[10px] text-campus-muted">
          Tile Engine: <span className="text-campus-text font-mono">OpenStreetMap Standard (Zero API Key)</span>
        </div>
      </div>

      <MapContainer
        center={centerPosition}
        zoom={16}
        scrollWheelZoom={true}
        className="w-full h-full campus-leaflet-container"
      >
        {/* Standard OpenStreetMap Tile Service - Free & Highly Reliable (No API Key Required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {activeVehicle && (
          <MapCenterController center={[activeVehicle.current_lat, activeVehicle.current_lng]} />
        )}

        {/* Highlighted Delivery Route Polyline */}
        {effectiveRouteWaypoints.length > 1 && (
          <>
            <Polyline
              positions={effectiveRouteWaypoints}
              color="#B9F66B"
              weight={4}
              opacity={0.9}
              dashArray="6, 8"
            />
            <Polyline
              positions={effectiveRouteWaypoints}
              color="#B9F66B"
              weight={12}
              opacity={0.2}
            />
          </>
        )}

        {/* Campus Facilities & Waypoint Nodes */}
        {Object.values(effectiveNodes).map((node) => {
          const isSelected = selectedDestination === node.id;
          return (
            <Marker
              key={node.id}
              position={[node.lat, node.lng]}
              icon={createBuildingIcon(node.type, node.name, isSelected)}
              eventHandlers={{
                click: () => onSelectNode && onSelectNode(node.id, node),
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2.5 min-w-[200px]">
                  <div className="font-extrabold text-sm text-campus-text">{node.name}</div>
                  <div className="text-xs text-campus-muted mt-1 leading-relaxed">{node.description}</div>
                  <div className="text-[10px] text-campus-accent mt-2 font-mono flex items-center justify-between">
                    <span>Elevation: {node.elevation_m}m</span>
                    <span className="capitalize px-1.5 py-0.5 rounded bg-campus-elevated">{node.type}</span>
                  </div>
                  {onSelectNode && (
                    <button
                      onClick={() => onSelectNode(node.id, node)}
                      className="mt-3 w-full py-1.5 text-center bg-campus-accent text-campus-bg text-xs font-bold rounded-xl shadow-glow-accent hover:bg-campus-accent-subtle transition"
                    >
                      {isSelected ? '✓ Selected Delivery Dropoff' : 'Deliver to this Building'}
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Autonomous Delivery Vehicles */}
        {effectiveVehicles.map((v) => (
          <Marker
            key={v.id}
            position={[v.current_lat, v.current_lng]}
            icon={createVehicleIcon(v.vehicle_type, v.vehicle_code, v.status, v.battery_percentage)}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-2.5 min-w-[220px]">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm text-campus-text">{v.model_name}</span>
                </div>
                <div className="text-xs font-mono text-campus-accent mt-0.5">{v.vehicle_code}</div>
                
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="p-1.5 rounded-lg bg-campus-bg/70 text-center">
                    <div className="text-[9px] text-campus-muted">Battery</div>
                    <div className="font-mono font-bold text-campus-accent">{v.battery_percentage.toFixed(1)}%</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-campus-bg/70 text-center">
                    <div className="text-[9px] text-campus-muted">Speed</div>
                    <div className="font-mono font-bold text-campus-text">{v.speed_kmh} km/h</div>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-campus-muted space-y-0.5">
                  <div>Status: <strong className="text-campus-text capitalize">{v.status}</strong></div>
                  <div>Max Payload: <strong className="text-campus-text">{v.max_payload_kg} kg</strong></div>
                  <div>Completed Missions: <strong className="text-campus-text">{v.total_deliveries}</strong></div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
