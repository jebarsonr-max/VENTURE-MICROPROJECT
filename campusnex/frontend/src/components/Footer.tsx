import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, ShieldCheck, Heart, Leaf, Cpu, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-campus-secondary border-t border-campus-border text-campus-muted mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-campus-card border border-campus-border flex items-center justify-center text-campus-accent">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-black text-lg tracking-tight text-campus-text">CAMPUS<span className="text-campus-accent">NEX</span></span>
            </div>
            <p className="text-xs leading-relaxed text-campus-muted">
              Next-generation autonomous ground robots & drone delivery ecosystem for modern universities.
              Integrating Course Outcomes CO1, CO3, and CO4 in Smart Mobility & Logistics.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-campus-accent">
              <span className="w-2 h-2 rounded-full bg-campus-accent animate-ping" />
              <span>Fleet Telemetry: Autonomous Grid Active</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold text-campus-text tracking-wider uppercase mb-3">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/marketplace" className="hover:text-campus-accent transition">Product Marketplace</Link></li>
              <li><Link to="/tracking" className="hover:text-campus-accent transition">Live GPS Tracking Map</Link></li>
              <li><Link to="/iot" className="hover:text-campus-accent transition">IoT Sensor Telemetry</Link></li>
              <li><Link to="/logistics" className="hover:text-campus-accent transition">Logistics Routing Engine</Link></li>
              <li><Link to="/sustainability" className="hover:text-campus-accent transition">Carbon Avoidance Analytics</Link></li>
            </ul>
          </div>

          {/* Academic Accreditation */}
          <div>
            <h4 className="text-xs font-bold text-campus-text tracking-wider uppercase mb-3">Curriculum Integration</h4>
            <ul className="space-y-2 text-xs text-campus-muted">
              <li className="flex items-start space-x-1.5">
                <span className="font-mono text-campus-accent font-bold">CO1:</span>
                <span>Smart Mobility Architecture & IoT Edge Telemetry</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="font-mono text-campus-accent font-bold">CO3:</span>
                <span>Dijkstra & A* Campus Logistics Optimization</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="font-mono text-campus-accent font-bold">CO4:</span>
                <span>Zero-Emission Green Campus Transportation</span>
              </li>
            </ul>
          </div>

          {/* Tech Stack Badge */}
          <div>
            <h4 className="text-xs font-bold text-campus-text tracking-wider uppercase mb-3">Engineering Architecture</h4>
            <div className="flex flex-wrap gap-1.5">
              {['FastAPI', 'Python 3.14', 'React 19', 'TypeScript', 'Leaflet OSM', 'TailwindCSS', 'SQLite/Postgres', 'Dijkstra / A*', 'Simulated MQTT'].map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 text-[10px] rounded font-mono bg-campus-elevated text-campus-text border border-campus-border"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="mt-4 p-2.5 rounded-lg bg-campus-card border border-campus-border text-[11px]">
              <span className="text-campus-accent font-semibold">Simulated Environment:</span> Fully compliant academic prototype ready for physical MQTT & Pixhawk autopilot hardware integration.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-campus-border flex flex-col sm:flex-row items-center justify-between text-xs text-campus-muted">
          <div>
            &copy; {new Date().getFullYear()} CAMPUSNEX — "Your Campus. Your Delivery. Your Time."
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span>Academic Capstone Micro-Project</span>
            <span>•</span>
            <span className="text-campus-accent">Smart Mobility & Autonomous Logistics</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
