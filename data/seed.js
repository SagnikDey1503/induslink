// Consolidated seed data: industries and machines

const industries = [
  {
    name: "Food Processing",
    slug: "food-processing",
    description: "Primary to packaged foods, with high compliance and throughput needs.",
    subIndustries: [
      { name: "Packaging & Labeling", slug: "packaging-labeling", description: "Form-fill-seal, labeling, and secondary packaging lines." },
      { name: "Dairy & Cold Chain", slug: "dairy-cold-chain", description: "Pasteurization, chilling, and hygienic handling systems." },
      { name: "Beverage & Bottling", slug: "beverage-bottling", description: "Rinsing, filling, capping, and inline QC." }
    ]
  },
  {
    name: "Packaging",
    slug: "packaging",
    description: "Primary, secondary, and tertiary packaging across industries.",
    subIndustries: [
      { name: "Flexible Packaging", slug: "flexible-packaging", description: "Pouches, laminates, and roll stock processing." },
      { name: "Corrugation", slug: "corrugation", description: "Box making, die cutting, and printing." },
      { name: "Printing & Labeling", slug: "printing-labeling", description: "Digital, flexo, and label finishing lines." }
    ]
  },
  {
    name: "Textiles",
    slug: "textiles",
    description: "Fabric manufacturing, finishing, and garmenting.",
    subIndustries: [
      { name: "Weaving", slug: "weaving", description: "High-speed looms and yarn preparation." },
      { name: "Dyeing & Finishing", slug: "dyeing-finishing", description: "Coloring, washing, and finishing systems." },
      { name: "Garmenting", slug: "garmenting", description: "Cutting, stitching, and automation." }
    ]
  },
  {
    name: "Metal Fabrication",
    slug: "metal-fabrication",
    description: "Precision metal cutting, forming, and finishing.",
    subIndustries: [
      { name: "Laser & Plasma Cutting", slug: "laser-plasma-cutting", description: "High-precision cutting for sheet metals." },
      { name: "CNC Machining", slug: "cnc-machining", description: "Milling and turning centers for components." },
      { name: "Surface Treatment", slug: "surface-treatment", description: "Coating, anodizing, and polishing." }
    ]
  },
  {
    name: "Plastics & Polymers",
    slug: "plastics-polymers",
    description: "Molding, extrusion, and recycling systems.",
    subIndustries: [
      { name: "Injection Molding", slug: "injection-molding", description: "High-repeatability molding systems." },
      { name: "Blow Molding", slug: "blow-molding", description: "Bottle and container production." },
      { name: "Recycling", slug: "recycling", description: "Granulation and reprocessing lines." }
    ]
  },
  {
    name: "Electronics & Components",
    slug: "electronics-components",
    description: "PCB assembly, soldering, and testing automation.",
    subIndustries: [
      { name: "PCB Assembly", slug: "pcb-assembly", description: "Pick and place, wave soldering, and reflow systems." },
      { name: "Component Testing", slug: "component-testing", description: "In-circuit testing and functional test fixtures." },
      { name: "Cable Harness Assembly", slug: "cable-harness", description: "Crimping, soldering, and assembly lines." }
    ]
  },
  {
    name: "Ceramic & Glass",
    slug: "ceramic-glass",
    description: "Ceramics, tiles, and glass manufacturing.",
    subIndustries: [
      { name: "Tile Manufacturing", slug: "tile-manufacturing", description: "Pressing, glazing, and kiln systems." },
      { name: "Glass Processing", slug: "glass-processing", description: "Tempering, laminating, and cutting lines." },
      { name: "Kiln Systems", slug: "kiln-systems", description: "Electric and gas kilns for firing." }
    ]
  },
  {
    name: "Pharmaceutical & Nutraceutical",
    slug: "pharma-nutraceutical",
    description: "Tablet pressing, capsule filling, and packaging with compliance.",
    subIndustries: [
      { name: "Tablet Pressing", slug: "tablet-pressing", description: "Rotary tablet presses with integrated dust extraction." },
      { name: "Capsule Filling", slug: "capsule-filling", description: "Capsule filling machines and size separation." },
      { name: "Pharma Packaging", slug: "pharma-packaging", description: "Blister packing, bottle filling, and sealing." }
    ]
  },
  {
    name: "Leather & Footwear",
    slug: "leather-footwear",
    description: "Leather tanning, finishing, and footwear manufacturing.",
    subIndustries: [
      { name: "Tanning & Finishing", slug: "tanning-finishing", description: "Chrome tanning, dyeing, and finishing lines." },
      { name: "Shoe Manufacturing", slug: "shoe-manufacturing", description: "Cutting, stitching, and assembly machinery." },
      { name: "Sole Molding", slug: "sole-molding", description: "Injection and compression molding for soles." }
    ]
  },
  {
    name: "Rubber & Tires",
    slug: "rubber-tires",
    description: "Rubber mixing, molding, and tire manufacturing.",
    subIndustries: [
      { name: "Rubber Mixing", slug: "rubber-mixing", description: "Industrial mixers and extruders for rubber compounds." },
      { name: "Tire Manufacturing", slug: "tire-manufacturing", description: "Building, curing, and testing systems." },
      { name: "Molding", slug: "rubber-molding", description: "Compression and transfer molding presses." }
    ]
  },
  {
    name: "Renewables & Energy",
    slug: "renewables-energy",
    description: "Solar, wind, energy storage and balance-of-plant equipment.",
    subIndustries: [
      { name: "Solar PV", slug: "solar-pv", description: "PV module assembly and mounting systems." },
      { name: "Energy Storage", slug: "energy-storage", description: "BESS racks and power conversion systems." },
      { name: "Wind", slug: "wind", description: "Small turbine manufacturing and nacelle assembly." }
    ]
  },
  {
    name: "Agriculture & Food Tech",
    slug: "agriculture-food-tech",
    description: "Harvesting, post-harvest, and food-tech equipment for agri MSMEs.",
    subIndustries: [
      { name: "Processing", slug: "agri-processing", description: "Threshing, milling and cleaning machines." },
      { name: "Irrigation", slug: "irrigation", description: "Pump and micro-irrigation equipment." },
      { name: "Cold Chain", slug: "agri-cold-chain", description: "Mobile cold rooms and reefer units." }
    ]
  }
];

const machines = [
  {
    name: "TriSeal 320 Form-Fill-Seal",
    slug: "triseal-320-ffs",
    description: "Compact VFFS system for snacks, grains, and powdered foods with high sealing integrity.",
    industrySlug: "food-processing",
    subIndustrySlug: "packaging-labeling",
    manufacturer: "TriSeal Automation",
    verified: true,
    features: ["Tool-less changeover under 20 minutes", "Servo-driven film pull for accuracy", "Integrated nitrogen flushing"],
    specs: [
      { key: "Speed", value: "Up to 70 packs/min" },
      { key: "Bag Width", value: "90-320 mm" },
      { key: "Power", value: "6.5 kW" }
    ],
    photos: ["https://images.unsplash.com/photo-1581091215367-59ab6f58c3fe?auto=format&fit=crop&w=1200&q=80"],
    minOrderQty: "1 unit",
    leadTimeDays: "30-45"
  },
  {
    name: "AquaLine Rotary Filler",
    slug: "aqualine-rotary-filler",
    description: "Rotary rinsing, filling, and capping line for PET bottles with inline QC.",
    industrySlug: "food-processing",
    subIndustrySlug: "beverage-bottling",
    manufacturer: "AquaLine Systems",
    verified: true,
    features: ["Auto CIP cleaning", "Vision-based cap inspection", "Remote OEE monitoring"],
    specs: [
      { key: "Speed", value: "Up to 9,000 bottles/hour" },
      { key: "Bottle Range", value: "200 ml - 2 L" },
      { key: "Air Consumption", value: "0.4 m3/min" }
    ],
    photos: ["https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80"],
    minOrderQty: "1 unit",
    leadTimeDays: "45-60"
  },
  {
    name: "FlexiPack 880 Laminator",
    slug: "flexipack-880-laminator",
    description: "High-clarity solvent-less laminator for flexible packaging lines.",
    industrySlug: "packaging",
    subIndustrySlug: "flexible-packaging",
    manufacturer: "FlexiPack Tech",
    verified: false,
    features: ["Solvent-less coating", "Auto tension control", "Web alignment system"],
    specs: [
      { key: "Speed", value: "Up to 250 m/min" },
      { key: "Web Width", value: "1200 mm" },
      { key: "Coating", value: "2-8 gsm" }
    ],
    photos: ["https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"],
    minOrderQty: "1 unit",
    leadTimeDays: "35-50"
  },
  {
    name: "CNC ProMill 750",
    slug: "cnc-promill-750",
    description: "Compact CNC milling center optimized for MSME production cells.",
    industrySlug: "metal-fabrication",
    subIndustrySlug: "cnc-machining",
    manufacturer: "ProMill Automation",
    verified: true,
    features: ["Rigid cast frame", "Auto tool changer", "Remote diagnostics"],
    specs: [
      { key: "Spindle", value: "10,000 rpm" },
      { key: "Table", value: "800 x 400 mm" },
      { key: "Power", value: "7.5 kW" }
    ],
    photos: ["https://images.unsplash.com/photo-1581092160607-ee67fd412a65?auto=format&fit=crop&w=1200&q=80"],
    minOrderQty: "1 unit",
    leadTimeDays: "35-45"
  },
  {
    name: "LaserCut X500",
    slug: "lasercut-x500",
    description: "Fiber laser cutting machine for sheet metal fabrication with precision nesting.",
    industrySlug: "metal-fabrication",
    subIndustrySlug: "laser-plasma-cutting",
    manufacturer: "LaserCut India",
    verified: true,
    features: ["Auto nesting software", "Dust extraction unit", "Remote diagnostics"],
    specs: [
      { key: "Laser Power", value: "3 kW" },
      { key: "Working Area", value: "1500 x 3000 mm" },
      { key: "Accuracy", value: "±0.03 mm" }
    ],
    photos: ["https://images.unsplash.com/photo-1581092334654-1db8f41f3d65?auto=format&fit=crop&w=1200&q=80"],
    minOrderQty: "1 unit",
    leadTimeDays: "45-60"
  },
  {
    name: "NovaSolder SMD Line",
    slug: "novasolder-smd-line",
    description: "Compact SMD soldering line with vision alignment for PCB assembly.",
    industrySlug: "electronics-components",
    subIndustrySlug: "pcb-assembly",
    manufacturer: "NovaSolder Tech",
    verified: true,
    features: ["Vision-based component placement", "Nitrogen reflow oven", "Automatic fiducial recognition"],
    specs: [
      { key: "Speed", value: "Up to 40,000 components/hour" },
      { key: "Accuracy", value: "±0.1 mm" },
      { key: "Board Size", value: "100 x 254 mm" }
    ],
    photos: ["https://images.unsplash.com/photo-1581092334654-1db8f41f3d65?auto=format&fit=crop&w=1200&q=80"],
    minOrderQty: "1 unit",
    leadTimeDays: "60-75"
  },
  {
    name: "CoolPure HTST Pasteurizer",
    slug: "coolpure-htst-pasteurizer",
    description: "HTST pasteurization system for dairy and beverage lines with compact footprint.",
    industrySlug: "food-processing",
    subIndustrySlug: "dairy-cold-chain",
    manufacturer: "CoolPure Technologies",
    verified: true,
    features: ["Automated temperature logging", "Low product loss design", "CIP-ready hygienic piping"],
    specs: [
      { key: "Capacity", value: "3,000 L/hr" },
      { key: "Heating", value: "Steam or electric" },
      { key: "Power", value: "9 kW" }
    ],
    photos: ["https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80"],
    minOrderQty: "1 unit",
    leadTimeDays: "35-50"
  },
  {
    name: "PolyMold 180T Injection",
    slug: "polymold-180t-injection",
    description: "Energy-efficient injection molding system for high-volume plastic components.",
    industrySlug: "plastics-polymers",
    subIndustrySlug: "injection-molding",
    manufacturer: "PolyMold Automation",
    verified: false,
    features: ["Hybrid servo drive", "Auto mold protection", "Compact hydraulic unit"],
    specs: [
      { key: "Clamping Force", value: "180 tons" },
      { key: "Shot Size", value: "320 g" },
      { key: "Power", value: "11 kW" }
    ],
    photos: ["https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"],
    minOrderQty: "1 unit",
    leadTimeDays: "30-45"
  },
  {
    name: "TilePress Pro 1200",
    slug: "tilepress-pro-1200",
    description: "Automatic tile pressing machine with PLC control for ceramic tiles.",
    industrySlug: "ceramic-glass",
    subIndustrySlug: "tile-manufacturing",
    manufacturer: "TilePress Solutions",
    verified: false,
    features: ["Hydraulic pressure system", "Automatic mold changer", "Dust collection system"],
    specs: [
      { key: "Press Force", value: "1200 tons" },
      { key: "Cycle Time", value: "8-12 seconds" },
      { key: "Tile Size", value: "300 x 300 mm to 600 x 1200 mm" }
    ],
    photos: ["https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"],
    minOrderQty: "1 unit",
    leadTimeDays: "55-70"
  },
  {
    name: "GlassTemper 1500",
    slug: "glastemper-1500",
    description: "Horizontal glass tempering oven for safety glass production.",
    industrySlug: "ceramic-glass",
    subIndustrySlug: "glass-processing",
    manufacturer: "GlassTech Solutions",
    verified: true,
    features: ["Electric heating elements", "Automatic temperature control", "Safety quench zone"],
    specs: [
      { key: "Max Glass Size", value: "1500 x 2500 mm" },
      { key: "Throughput", value: "60-80 m²/hour" },
      { key: "Temperature Range", value: "400-700°C" }
    ],
    photos: ["https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"],
    minOrderQty: "1 unit",
    leadTimeDays: "65-80"
  },
  {
    name: "AgriMill 200",
    slug: "agrimill-200",
    description: "Small-scale grain milling plant for rural MSMEs with modular components.",
    industrySlug: "agriculture-food-tech",
    subIndustrySlug: "agri-processing",
    manufacturer: "AgriEquip Co",
    verified: false,
    features: ["Modular design", "Low power consumption", "Dust control"],
    specs: [
      { key: "Throughput", value: "200-500 kg/hr" },
      { key: "Power", value: "3.5 kW" }
    ],
    photos: ["https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80"],
    minOrderQty: "1 unit",
    leadTimeDays: "20-35"
  }
];

module.exports = { industries, machines };
