import { Category, Product, Vendor, Vehicle, CampusNode, SustainabilityMetrics, User, Order } from '../types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "Food & Beverages", slug: "food-beverages", description: "Fresh meals, snacks, gourmet coffees, and hydration", icon: "Utensils" },
  { id: 2, name: "Stationery & Supplies", slug: "stationery", description: "Drafting tools, notebooks, pens, and printing materials", icon: "PenTool" },
  { id: 3, name: "Academic Books", slug: "books", description: "Curriculum textbooks, references, and research manuals", icon: "BookOpen" },
  { id: 4, name: "Laboratory Essentials", slug: "lab-essentials", description: "Sterile labware, chemicals, safety gear, and testing reagents", icon: "FlaskConical" },
  { id: 5, name: "General Campus Needs", slug: "campus-needs", description: "Chargers, dorm supplies, umbrellas, and hygiene kits", icon: "ShoppingBag" }
];

export const MOCK_VENDORS: Vendor[] = [
  {
    id: 1,
    user_id: 2,
    store_name: "Cafeteria Express & Deli",
    category: "Food & Beverages",
    building_location: "Central Food Court & Cafeteria",
    lat: 12.97120,
    lng: 77.59400,
    rating: 4.9,
    banner_url: "/images/campus/cafeteria_banner.jpg",
    is_active: true
  },
  {
    id: 2,
    user_id: 3,
    store_name: "Campus Stationery & Print Hub",
    category: "Stationery & Supplies",
    building_location: "Academic Quadrangle Store #4",
    lat: 12.97250,
    lng: 77.59520,
    rating: 4.8,
    banner_url: "/images/campus/stationery_banner.jpg",
    is_active: true
  },
  {
    id: 3,
    user_id: 4,
    store_name: "BioMaterials & Science Depot",
    category: "Laboratory Essentials",
    building_location: "Bioengineering Research Complex Wing B",
    lat: 12.97080,
    lng: 77.59600,
    rating: 5.0,
    banner_url: "/images/campus/biolab_banner.jpg",
    is_active: true
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    vendor_id: 1,
    category_id: 1,
    name: "Artisan Avocado & Halloumi Panini",
    description: "Toasted sourdough with crushed Hass avocado, grilled Cypriot halloumi, heirloom tomatoes, and basil pesto drizzle.",
    price: 165.0,
    stock: 45,
    image_url: "/images/food/avocado_panini.jpg",
    weight_kg: 0.35,
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    vendor_id: 1,
    category_id: 1,
    name: "Nitro Cold Brew Coffee (350ml)",
    description: "Single-origin Arabica cold brewed for 18 hours, nitrogen-infused for a velvety cascade and micro-foam head.",
    price: 120.0,
    stock: 60,
    image_url: "/images/food/cold_brew.jpg",
    weight_kg: 0.40,
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    vendor_id: 1,
    category_id: 1,
    name: "Mediterranean Quinoa Protein Bowl",
    description: "Tricolor organic quinoa, roasted chickpeas, kalamata olives, feta, crisp cucumber, and cold-pressed lemon-tahini vinaigrette.",
    price: 195.0,
    stock: 30,
    image_url: "/images/food/quinoa_bowl.jpg",
    weight_kg: 0.50,
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    vendor_id: 2,
    category_id: 2,
    name: "Technical Fineliner Pen Set (0.1 - 0.8mm)",
    description: "Archival pigment ink pens with stainless steel nibs. Waterproof, fade-proof, ideal for engineering schematics and architectural drafting.",
    price: 280.0,
    stock: 80,
    image_url: "/images/stationery/technical_pens.jpg",
    weight_kg: 0.15,
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    vendor_id: 2,
    category_id: 2,
    name: "Engineering Dot-Grid Hardbound Notebook",
    description: "192 pages of 120gsm fountain-pen-friendly bleed-resistant paper. Subtle 5mm dot grid matrix with numbered pages and dual ribbon markers.",
    price: 210.0,
    stock: 50,
    image_url: "/images/stationery/grid_notebook.jpg",
    weight_kg: 0.45,
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    vendor_id: 2,
    category_id: 2,
    name: "Advanced Natural Display Scientific Calculator",
    description: "552 functions, high-resolution natural textbook display, spreadsheet calculation, matrix calculations, and dual solar/battery power.",
    price: 1450.0,
    stock: 25,
    image_url: "/images/stationery/scientific_calculator.jpg",
    weight_kg: 0.28,
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 7,
    vendor_id: 2,
    category_id: 3,
    name: "Introduction to Algorithms (4th Edition - CLRS)",
    description: "The definitive global authority on modern computer algorithms by Cormen, Leiserson, Rivest, and Stein. Comprehensive academic reference.",
    price: 890.0,
    stock: 18,
    image_url: "/images/books/algorithms_book.jpg",
    weight_kg: 1.20,
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 8,
    vendor_id: 3,
    category_id: 4,
    name: "Sterile Filtered Pipette Tips (10-100µL, Rack of 96)",
    description: "RNase, DNase, Endotoxin, and pyrogen-free premium polyethylene aerosol-barrier filter tips for molecular biology and PCR testing.",
    price: 650.0,
    stock: 40,
    image_url: "/images/laboratory/pipette_tips.jpg",
    weight_kg: 0.22,
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 9,
    vendor_id: 3,
    category_id: 4,
    name: "UV-Sterilized Anti-Fog Lab Safety Goggles",
    description: "ANSI Z87.1 certified impact-resistant polycarbonate wrap-around eye protection with indirect vents and scratch-resistant coating.",
    price: 340.0,
    stock: 55,
    image_url: "/images/laboratory/safety_goggles.jpg",
    weight_kg: 0.18,
    is_available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 10,
    vendor_id: 2,
    category_id: 5,
    name: "65W GaN Fast Charger & Multi-Device Braided Cable",
    description: "Ultra-compact Gallium Nitride dual USB-C and USB-A high-speed fast charging brick paired with a 2-meter braided 100W PD nylon cord.",
    price: 1290.0,
    stock: 35,
    image_url: "/images/campus/laptop_charger.jpg",
    weight_kg: 0.26,
    is_available: true,
    created_at: new Date().toISOString()
  }
];

export const MOCK_CAMPUS_NODES: Record<string, CampusNode> = {
  CAFETERIA: {
    id: "CAFETERIA",
    name: "Central Cafeteria & Food Court",
    lat: 12.97120,
    lng: 77.59400,
    elevation_m: 915.0,
    type: "vendor",
    description: "Campus Dining Hub, Micro-kitchens & Deli"
  },
  STATIONERY_HUB: {
    id: "STATIONERY_HUB",
    name: "Stationery & Tech Store",
    lat: 12.97250,
    lng: 77.59520,
    elevation_m: 918.0,
    type: "vendor",
    description: "Curriculum materials, electronics, and drafting gear"
  },
  BIOLAB: {
    id: "BIOLAB",
    name: "BioMaterials & Nanotech Lab",
    lat: 12.97080,
    lng: 77.59600,
    elevation_m: 914.0,
    type: "lab",
    description: "Sterile reagent depository and life science suites"
  },
  LIBRARY: {
    id: "LIBRARY",
    name: "Central Research Library",
    lat: 12.97190,
    lng: 77.59320,
    elevation_m: 920.0,
    type: "academic",
    description: "Quiet study zones, archives, and digital media labs"
  },
  HOSTEL_A: {
    id: "HOSTEL_A",
    name: "Hostel Alpha (North Wing)",
    lat: 12.97340,
    lng: 77.59280,
    elevation_m: 922.0,
    type: "residential",
    description: "Student Residences Block A (North Dropoff Locker)"
  },
  HOSTEL_B: {
    id: "HOSTEL_B",
    name: "Hostel Beta (South Wing)",
    lat: 12.96980,
    lng: 77.59450,
    elevation_m: 912.0,
    type: "residential",
    description: "Student Residences Block B (South Dropoff Locker)"
  },
  MECH_BLOCK: {
    id: "MECH_BLOCK",
    name: "Mechanical & Robotics Complex",
    lat: 12.97010,
    lng: 77.59210,
    elevation_m: 910.0,
    type: "academic",
    description: "Autonomous mobility labs & prototyping hangars"
  },
  SPORTS_ARENA: {
    id: "SPORTS_ARENA",
    name: "Campus Sports Complex",
    lat: 12.97380,
    lng: 77.59580,
    elevation_m: 924.0,
    type: "recreation",
    description: "Athletics stadium, aquatic center, and outdoor fields"
  },
  ROBOT_DOCK: {
    id: "ROBOT_DOCK",
    name: "CAMPUSNEX Autonomous Dock & Vertiport",
    lat: 12.97180,
    lng: 77.59480,
    elevation_m: 916.0,
    type: "infrastructure",
    description: "Robotic fleet charging pads, telemetry server, and drone vertipad"
  }
};

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 1,
    vehicle_code: "ROBOT-NX-01",
    vehicle_type: "robot",
    model_name: "NexusRover UGV Mark IV",
    status: "delivering",
    battery_percentage: 84.0,
    current_lat: 12.97150,
    current_lng: 77.59440,
    speed_kmh: 12.4,
    max_payload_kg: 15.0,
    total_deliveries: 142,
    total_distance_km: 348.6,
    is_active: true,
    last_ping: new Date().toISOString()
  },
  {
    id: 2,
    vehicle_code: "ROBOT-NX-02",
    vehicle_type: "robot",
    model_name: "NexusRover UGV Mark IV",
    status: "idle",
    battery_percentage: 96.0,
    current_lat: 12.97180,
    current_lng: 77.59480,
    speed_kmh: 0.0,
    max_payload_kg: 15.0,
    total_deliveries: 98,
    total_distance_km: 215.2,
    is_active: true,
    last_ping: new Date().toISOString()
  },
  {
    id: 3,
    vehicle_code: "DRONE-SD-01",
    vehicle_type: "drone",
    model_name: "SkyDart Quad-VTOL 800",
    status: "delivering",
    battery_percentage: 72.0,
    current_lat: 12.97210,
    current_lng: 77.59390,
    speed_kmh: 38.0,
    max_payload_kg: 4.5,
    total_deliveries: 210,
    total_distance_km: 485.0,
    is_active: true,
    last_ping: new Date().toISOString()
  },
  {
    id: 4,
    vehicle_code: "DRONE-SD-02",
    vehicle_type: "drone",
    model_name: "SkyDart Quad-VTOL 800",
    status: "idle",
    battery_percentage: 100.0,
    current_lat: 12.97180,
    current_lng: 77.59480,
    speed_kmh: 0.0,
    max_payload_kg: 4.5,
    total_deliveries: 77,
    total_distance_km: 162.4,
    is_active: true,
    last_ping: new Date().toISOString()
  },
  {
    id: 5,
    vehicle_code: "ROBOT-NX-03",
    vehicle_type: "robot",
    model_name: "TitanCargo Heavy UGV",
    status: "charging",
    battery_percentage: 38.0,
    current_lat: 12.97180,
    current_lng: 77.59480,
    speed_kmh: 0.0,
    max_payload_kg: 35.0,
    total_deliveries: 53,
    total_distance_km: 124.9,
    is_active: true,
    last_ping: new Date().toISOString()
  }
];

export const MOCK_USERS: Record<string, User> = {
  student: {
    id: 1,
    name: "Alex Chen",
    email: "student@campusnex.edu",
    role: "student",
    phone: "+91 98765 43210",
    campus_id: "STU-2026-8812",
    hostel_block: "Hostel Alpha (North Wing)",
    is_active: true,
    created_at: new Date().toISOString()
  },
  vendor: {
    id: 2,
    name: "Chef Marco",
    email: "vendor@campusnex.edu",
    role: "vendor",
    phone: "+91 98765 43211",
    campus_id: "VEN-2026-001",
    is_active: true,
    created_at: new Date().toISOString()
  },
  admin: {
    id: 5,
    name: "Campus Dispatch Operations",
    email: "admin@campusnex.edu",
    role: "admin",
    phone: "+91 98765 43299",
    campus_id: "ADM-DISPATCH-01",
    is_active: true,
    created_at: new Date().toISOString()
  }
};

export const MOCK_ORDERS: Order[] = [
  {
    id: 101,
    order_number: "ORD-NEX-8821",
    student_id: 1,
    vendor_id: 1,
    status: "in_transit",
    priority: "normal",
    total_amount: 285.0,
    delivery_fee: 0.0,
    total_weight_kg: 0.75,
    delivery_location_name: "Hostel Alpha (North Wing)",
    delivery_lat: 12.97340,
    delivery_lng: 77.59280,
    created_at: new Date(Date.now() - 12 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 1,
        product_id: 1,
        product_name: "Artisan Avocado & Halloumi Panini",
        unit_price: 165.0,
        quantity: 1,
        subtotal: 165.0,
        unit_weight_kg: 0.35
      },
      {
        id: 2,
        product_id: 2,
        product_name: "Nitro Cold Brew Coffee (350ml)",
        unit_price: 120.0,
        quantity: 1,
        subtotal: 120.0,
        unit_weight_kg: 0.40
      }
    ],
    assignment: {
      id: 1,
      order_id: 101,
      vehicle_id: 1,
      assigned_at: new Date(Date.now() - 6 * 60000).toISOString(),
      pickup_location_name: "Central Cafeteria",
      pickup_lat: 12.97120,
      pickup_lng: 77.59400,
      destination_location_name: "Hostel Alpha",
      destination_lat: 12.97340,
      destination_lng: 77.59280,
      estimated_distance_km: 0.65,
      estimated_duration_mins: 8.5,
      status: "in_transit",
      current_step_index: 1,
      route_waypoints: [
        [12.97120, 77.59400],
        [12.97190, 77.59320],
        [12.97340, 77.59280]
      ],
      vehicle: {
        id: 1,
        vehicle_code: "ROBOT-NX-01",
        vehicle_type: "robot",
        model_name: "NexusRover UGV Mark IV",
        status: "delivering",
        battery_percentage: 84.0,
        current_lat: 12.97150,
        current_lng: 77.59440,
        speed_kmh: 12.4,
        max_payload_kg: 15.0,
        total_deliveries: 142,
        total_distance_km: 348.6,
        is_active: true
      }
    }
  }
];

export const MOCK_SUSTAINABILITY: SustainabilityMetrics = {
  total_deliveries_completed: 580,
  total_distance_travelled_km: 1210.8,
  estimated_co2_avoided_kg: 278.4,
  petrol_litres_saved: 118.5,
  clean_kwh_consumed: 50.8,
  robot_delivery_pct: 68.0,
  drone_delivery_pct: 32.0,
  avg_delivery_time_mins: 7.8,
  calculation_basis: "Real-time AI telemetry vs 125cc petrol campus scooter baseline"
};
