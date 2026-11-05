import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bot,
  Plane,
  Zap,
  Shield,
  Clock,
  Leaf,
  Layers,
  ArrowRight,
  CheckCircle2,
  Cpu,
  MapPin,
  TrendingUp,
  Compass,
  Sparkles,
  BarChart3,
  FlaskConical,
  BookOpen,
  Utensils,
  PenTool,
  Radio,
  Gauge
} from 'lucide-react';
import { CampusMap } from '../components/CampusMap';
import { SafeImage } from '../components/SafeImage';
import { api } from '../services/api';
import { CampusNode, Vehicle, SustainabilityMetrics } from '../types';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchDemoAccount } = useAuth();
  const [campusNodes, setCampusNodes] = useState<Record<string, CampusNode>>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [metrics, setMetrics] = useState<SustainabilityMetrics | null>(null);

  useEffect(() => {
    api.getCampusNodes().then(setCampusNodes).catch(() => {});
    api.getVehicles().then(setVehicles).catch(() => {});
    api.getSustainabilityMetrics().then(setMetrics).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-campus-bg text-campus-text">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 border-b border-campus-border">
        {/* Futuristic Grid & Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#2C3B42_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-campus-accent/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline, Description & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-campus-elevated border border-campus-border text-xs text-campus-accent">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span className="font-semibold tracking-wide uppercase text-[10px]">Autonomous Smart Mobility Ecosystem</span>
                <span className="text-campus-muted">•</span>
                <span className="text-campus-text font-mono">CO1 • CO3 • CO4</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Campus Deliveries. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-campus-accent via-campus-accent-subtle to-white">
                  Reimagined.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-campus-muted max-w-xl leading-relaxed">
                Experience a smarter way to move essentials across campus with autonomous delivery robots, high-speed aerial drones, and intelligent graph route optimization.
              </p>

              {/* Tagline Badge */}
              <div className="p-3.5 rounded-2xl bg-campus-card border border-campus-border max-w-md text-xs text-campus-text flex items-center space-x-3 shadow-md">
                <span className="font-mono text-campus-accent font-bold">TAGLINE:</span>
                <span className="font-medium italic">"Your Campus. Your Delivery. Your Time."</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/marketplace"
                  className="px-6 py-3.5 rounded-xl bg-campus-accent text-campus-bg font-extrabold text-sm hover:bg-campus-accent-subtle shadow-glow-accent transition flex items-center space-x-2"
                >
                  <span>Explore Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/tracking"
                  className="px-6 py-3.5 rounded-xl bg-campus-card border border-campus-border text-campus-text font-bold text-sm hover:border-campus-accent transition flex items-center space-x-2"
                >
                  <MapPin className="w-4 h-4 text-campus-accent" />
                  <span>Track a Delivery</span>
                </Link>
              </div>

              {/* Quick 1-Click Evaluator Launcher */}
              <div className="pt-4 border-t border-campus-border/60">
                <div className="text-[11px] font-bold text-campus-muted uppercase tracking-wider mb-2.5">
                  1-Click Evaluator Demo Sign-in:
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => { switchDemoAccount('student'); navigate('/student'); }}
                    className="px-3.5 py-2 rounded-xl bg-campus-elevated border border-campus-border hover:border-campus-accent text-xs font-semibold text-campus-text flex items-center space-x-2 transition shadow-sm hover:scale-[1.02]"
                  >
                    <span>🎓 Student Mode</span>
                  </button>
                  <button
                    onClick={() => { switchDemoAccount('vendor'); navigate('/vendor'); }}
                    className="px-3.5 py-2 rounded-xl bg-campus-elevated border border-campus-border hover:border-campus-accent-subtle text-xs font-semibold text-campus-text flex items-center space-x-2 transition shadow-sm hover:scale-[1.02]"
                  >
                    <span>🍽️ Vendor Mode</span>
                  </button>
                  <button
                    onClick={() => { switchDemoAccount('admin'); navigate('/admin'); }}
                    className="px-3.5 py-2 rounded-xl bg-campus-elevated border border-campus-border hover:border-emerald-400 text-xs font-semibold text-campus-text flex items-center space-x-2 transition shadow-sm hover:scale-[1.02]"
                  >
                    <span>⚡ Admin Ops Mode</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Visual with Real Autonomous Delivery Robot */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl bg-gradient-to-br from-campus-card via-campus-elevated to-campus-card border border-campus-border p-6 shadow-2xl overflow-hidden group">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-campus-border">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-campus-accent animate-ping" />
                    <span className="font-bold text-xs uppercase tracking-wider text-campus-text">Autonomous Robot Grid Active</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-campus-bg text-campus-accent border border-campus-border">
                    LiDAR + RTK GPS
                  </span>
                </div>

                {/* High-Quality Real Autonomous Delivery Robot Visual */}
                <div className="my-6 relative rounded-2xl overflow-hidden border border-campus-border bg-campus-bg aspect-[4/3] shadow-lg">
                  <SafeImage
                    src="/images/hero/delivery_robot_hero.jpg"
                    alt="Autonomous Ground Delivery Robot on Modern Campus"
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Subtle Gradient overlay for text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-campus-bg via-campus-bg/20 to-transparent pointer-events-none" />

                  {/* Floating Vehicle Telemetry Card */}
                  <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-2xl bg-campus-card/95 backdrop-blur-md border border-campus-accent/50 shadow-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-campus-elevated border border-campus-accent flex items-center justify-center text-campus-accent">
                          <Bot className="w-4 h-4 animate-pulse" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-campus-text">NexusRover UGV-01</div>
                          <div className="text-[9px] text-campus-muted font-mono">ID: ROBOT-NX1 • 25kg Payload</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono font-bold text-campus-accent">94% Battery</div>
                        <div className="text-[8px] text-emerald-400 font-mono">Solar Docked</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-campus-muted pt-1 border-t border-campus-border/60">
                      <div>Status: <strong className="text-campus-accent">In Transit</strong></div>
                      <div className="text-right">Speed: <strong className="text-campus-text font-mono">14.8 km/h</strong></div>
                    </div>
                  </div>
                </div>

                {/* Specs Quick Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-campus-bg border border-campus-border">
                    <div className="text-[10px] text-campus-muted">Zero Emissions</div>
                    <div className="text-xs font-black text-campus-accent">100% Electric</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-campus-bg border border-campus-border">
                    <div className="text-[10px] text-campus-muted">Campus ETA</div>
                    <div className="text-xs font-black text-campus-text">&lt; 7 Mins</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-campus-bg border border-campus-border">
                    <div className="text-[10px] text-campus-muted">Drone Speed</div>
                    <div className="text-xs font-black text-campus-accent-subtle">45 km/h</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 1: HOW CAMPUSNEX WORKS */}
      <section className="py-20 bg-campus-secondary/60 border-b border-campus-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-campus-accent mb-2">Order Lifecycle</h2>
            <p className="text-3xl font-extrabold text-campus-text">How Autonomous Campus Logistics Works</p>
            <p className="text-sm text-campus-muted mt-2">End-to-end coordinated intelligence connecting student, vendor, and autonomous dispatch.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Order Essentials',
                desc: 'Select food, lab reagents, stationery, or textbooks with precise campus dropoff pin.',
                icon: Utensils,
              },
              {
                step: '02',
                title: 'Vendor Prepares',
                desc: 'Campus vendor confirms inventory, packages order securely, and marks ready for pickup.',
                icon: CheckCircle2,
              },
              {
                step: '03',
                title: 'Algorithmic Dispatch',
                desc: 'Dijkstra & A* routing evaluates payload, vehicle battery, and assigns the optimal robot or drone.',
                icon: Layers,
              },
              {
                step: '04',
                title: 'Autonomous Arrival',
                desc: 'Track the delivery live in real-time on the map and confirm package pickup with your passcode.',
                icon: Bot,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="p-6 rounded-3xl bg-campus-card border border-campus-border relative group hover:border-campus-accent transition-all duration-300">
                  <div className="text-2xl font-black text-campus-accent/20 font-mono mb-3">{item.step}</div>
                  <div className="w-10 h-10 rounded-xl bg-campus-elevated border border-campus-border flex items-center justify-center text-campus-accent mb-4 group-hover:shadow-glow-accent transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-campus-text mb-1">{item.title}</h3>
                  <p className="text-xs text-campus-muted leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 2: EXPLORE DELIVERY SERVICES WITH VERIFIED PHOTOGRAPHY */}
      <section className="py-20 border-b border-campus-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-campus-accent mb-2">Ecosystem Catalog</h2>
              <p className="text-3xl font-extrabold text-campus-text">Explore Delivery Categories</p>
            </div>
            <Link to="/marketplace" className="mt-4 md:mt-0 text-xs font-bold text-campus-accent hover:underline flex items-center space-x-1">
              <span>View all marketplace products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                name: 'Food & Gourmet Beverages',
                desc: 'Hot artisanal paninis, cold brews, and fresh nutrient bowls delivered warm to your dorm.',
                image: '/images/food/avocado_panini.jpg',
                slug: 'food-beverages',
                badge: 'Hot & Cold Insulated',
              },
              {
                name: 'Stationery & Drafting',
                desc: 'Technical drawing pens, waterproof lab journals, and graphing calculators.',
                image: '/images/stationery/grid_notebook.jpg',
                slug: 'stationery',
                badge: 'Academic Supplies',
              },
              {
                name: 'Academic Textbooks',
                desc: 'Algorithm references, hardware fabrication guides, and standard curriculum manuals.',
                image: '/images/books/algorithms_book.jpg',
                slug: 'books',
                badge: 'Curriculum Texts',
              },
              {
                name: 'Laboratory Essentials',
                desc: 'Sterile pipettes, nitrile safety equipment, and certified chemical reagents via high-speed drone.',
                image: '/images/laboratory/pipette_tips.jpg',
                slug: 'lab-essentials',
                badge: 'High-Priority UAV',
              },
            ].map((c) => (
              <div
                key={c.name}
                className="group rounded-3xl bg-campus-card border border-campus-border overflow-hidden hover:border-campus-accent/60 transition-all duration-300 flex flex-col justify-between hover:shadow-glow-accent/20"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-campus-elevated">
                  <SafeImage
                    src={c.image}
                    alt={c.name}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-campus-card via-transparent to-transparent opacity-80" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-campus-bg/85 backdrop-blur-md text-campus-accent border border-campus-border">
                    {c.badge}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-campus-text group-hover:text-campus-accent transition">
                      {c.name}
                    </h3>
                    <p className="text-xs text-campus-muted mt-1 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-campus-border/60 flex items-center justify-between">
                    <Link
                      to={`/marketplace?category=${c.slug}`}
                      className="text-xs font-bold text-campus-accent hover:underline flex items-center space-x-1"
                    >
                      <span>Explore Category</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 & 4: ROBOT & DRONE TECHNOLOGY */}
      <section className="py-20 bg-campus-secondary/40 border-b border-campus-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Ground Robot Tech with Verified Local Image */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-campus-elevated text-campus-accent text-[11px] font-mono border border-campus-border">
                <Bot className="w-3.5 h-3.5" />
                <span>Autonomous Ground Vehicle (UGV)</span>
              </div>
              <h2 className="text-3xl font-extrabold text-campus-text">NexusRover Mark 3 Ground Robot</h2>
              <p className="text-sm text-campus-muted leading-relaxed">
                Engineered for campus pathways, pedestrian sidewalks, and curb navigation. Features 360° LiDAR slam mapping, ultrasonic depth sensors, and a thermal-insulated 25 kg payload compartment for heavy food and textbook deliveries.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-campus-card border border-campus-border">
                  <div className="text-[10px] text-campus-muted uppercase font-mono">Payload Capacity</div>
                  <div className="font-extrabold text-sm text-campus-text">Up to 25.0 kg</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-campus-card border border-campus-border">
                  <div className="text-[10px] text-campus-muted uppercase font-mono">Pathway Speed</div>
                  <div className="font-extrabold text-sm text-campus-accent">15.0 km/h (Safe Cruise)</div>
                </div>
              </div>
            </div>
            
            <div className="rounded-3xl overflow-hidden border border-campus-border aspect-[16/10] bg-campus-card shadow-2xl">
              <SafeImage
                src="/images/robots/nexus_rover.jpg"
                alt="NexusRover Autonomous Ground Robot"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Drone Tech with Verified Local Image */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 rounded-3xl overflow-hidden border border-campus-border aspect-[16/10] bg-campus-card shadow-2xl">
              <SafeImage
                src="/images/drones/skydart_drone.jpg"
                alt="SkyDart Delivery Drone"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="order-1 lg:order-2 space-y-4">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-campus-elevated text-campus-accent-subtle text-[11px] font-mono border border-campus-border">
                <Plane className="w-3.5 h-3.5" />
                <span>Autonomous Aerial Vehicle (UAV)</span>
              </div>
              <h2 className="text-3xl font-extrabold text-campus-text">SkyDart Octocopter Express</h2>
              <p className="text-sm text-campus-muted leading-relaxed">
                When time is critical for emergency laboratory reagents, medical supplies, or urgent study materials. Flies in dedicated 3D geofenced aerial corridors at 45m AGL, avoiding all ground traffic.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-campus-card border border-campus-border">
                  <div className="text-[10px] text-campus-muted uppercase font-mono">Flight Speed</div>
                  <div className="font-extrabold text-sm text-campus-accent-subtle">45.0 km/h High-Velocity</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-campus-card border border-campus-border">
                  <div className="text-[10px] text-campus-muted uppercase font-mono">Precision Hover</div>
                  <div className="font-extrabold text-sm text-campus-text">&plusmn;5cm RTK GPS Docking</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: LIVE CAMPUS TRACKING PREVIEW */}
      <section className="py-20 border-b border-campus-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-campus-accent mb-2">Live Geospatial Network</h2>
              <p className="text-3xl font-extrabold text-campus-text">Interactive Campus Fleet Map</p>
            </div>
            <Link
              to="/tracking"
              className="mt-4 md:mt-0 px-4 py-2 rounded-xl bg-campus-card border border-campus-border text-xs font-bold text-campus-accent hover:border-campus-accent transition flex items-center space-x-2 shadow-sm"
            >
              <span>Open Fullscreen Tracking</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <CampusMap campusNodes={campusNodes} vehicles={vehicles} height="500px" />
        </div>
      </section>

      {/* SECTION 6: SUSTAINABILITY IMPACT */}
      {metrics && (
        <section className="py-20 bg-campus-secondary/60 border-b border-campus-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-semibold mb-3">
                <Leaf className="w-3.5 h-3.5" />
                <span>Zero-Emission Green Transportation</span>
              </div>
              <h2 className="text-3xl font-extrabold text-campus-text">Real-Time Environmental Impact</h2>
              <p className="text-sm text-campus-muted mt-2">
                Empirical calculations comparing CAMPUSNEX electric UGV/UAV operations vs standard 125cc combustion delivery motorbikes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-campus-card border border-campus-border text-center shadow-lg">
                <div className="text-xs text-campus-muted font-medium mb-1">CO₂ Emissions Avoided</div>
                <div className="text-3xl font-black text-campus-accent font-mono">{metrics.estimated_co2_avoided_kg} kg</div>
                <div className="text-[10px] text-campus-muted mt-2">Compared to petrol combustion</div>
              </div>
              <div className="p-6 rounded-3xl bg-campus-card border border-campus-border text-center shadow-lg">
                <div className="text-xs text-campus-muted font-medium mb-1">Petrol Fuel Saved</div>
                <div className="text-3xl font-black text-campus-accent-subtle font-mono">{metrics.petrol_litres_saved} L</div>
                <div className="text-[10px] text-campus-muted mt-2">Fossil fuel displaced</div>
              </div>
              <div className="p-6 rounded-3xl bg-campus-card border border-campus-border text-center shadow-lg">
                <div className="text-xs text-campus-muted font-medium mb-1">Autonomous Deliveries</div>
                <div className="text-3xl font-black text-white font-mono">{metrics.total_deliveries_completed}</div>
                <div className="text-[10px] text-campus-muted mt-2">Zero traffic accidents logged</div>
              </div>
              <div className="p-6 rounded-3xl bg-campus-card border border-campus-border text-center shadow-lg">
                <div className="text-xs text-campus-muted font-medium mb-1">Total Distance Traveled</div>
                <div className="text-3xl font-black text-campus-accent font-mono">{metrics.total_distance_travelled_km} km</div>
                <div className="text-[10px] text-campus-muted mt-2">Clean solar-charged electricity</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 7: ACADEMIC ACCREDITATION & CO MAPPING */}
      <section className="py-20 border-b border-campus-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-campus-card border border-campus-border shadow-2xl">
            <div className="max-w-3xl">
              <h2 className="text-xs font-bold uppercase tracking-widest text-campus-accent mb-2">Curriculum Accreditation</h2>
              <h3 className="text-2xl font-extrabold text-campus-text">Smart Mobility & Logistics Engineering (CO1, CO3, CO4)</h3>
              <p className="text-xs text-campus-muted mt-2 leading-relaxed">
                CAMPUSNEX was architected specifically to fulfill university academic outcomes in automated transportation systems, graph algorithmic dispatching, and IoT edge sensing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="p-5 rounded-2xl bg-campus-elevated border border-campus-border space-y-2">
                <div className="font-mono text-campus-accent font-bold text-sm">CO1: IoT Edge Telemetry</div>
                <p className="text-xs text-campus-muted leading-relaxed">
                  Multi-sensor telemetry pipeline monitoring battery degradation, core operating temperature, vibration g-force, and RTK GPS coordinates.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-campus-elevated border border-campus-border space-y-2">
                <div className="font-mono text-campus-accent-subtle font-bold text-sm">CO3: Route Optimization</div>
                <p className="text-xs text-campus-muted leading-relaxed">
                  Dijkstra's Single-Source Shortest Path & A* Heuristic search across campus topological graph, minimizing traversal latency and energy expenditure.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-campus-elevated border border-campus-border space-y-2">
                <div className="font-mono text-emerald-400 font-bold text-sm">CO4: Green Logistics</div>
                <p className="text-xs text-campus-muted leading-relaxed">
                  Quantifiable carbon abatement metrics calculating avoided greenhouse gas emissions vs standard motorcycle courier delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
