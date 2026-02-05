const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const dbConnect = require("../config/db");
const User = require("../models/User");
const Industry = require("../models/Industry");
const Machine = require("../models/Machine");
const Lead = require("../models/Lead");
const MachineRequest = require("../models/MachineRequest");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const MachineVerification = require("../models/MachineVerification");
const Wishlist = require("../models/Wishlist");
const SavedMachine = require("../models/SavedMachine");

const resetAndSeed = async () => {
  try {
    await dbConnect();
    console.log("Connected to database");

    // Clear all collections
    await User.deleteMany({});
    await Industry.deleteMany({});
    await Machine.deleteMany({});
    await Lead.deleteMany({});
    await MachineRequest.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    await MachineVerification.deleteMany({});
    await Wishlist.deleteMany({});
    await SavedMachine.deleteMany({});
    console.log("Cleared all existing data");

    // Create test users
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const buyer1 = await User.create({
      role: "msme",
      name: "Rajesh Kumar",
      email: "buyer1@test.com",
      phone: "+91-9876543210",
      companyName: "Kumar Foods Pvt Ltd",
      industry: "food-processing",
      subIndustry: "packaging-labeling",
      location: "Mumbai, Maharashtra",
      passwordHash: hashedPassword
    });

    const buyer2 = await User.create({
      role: "msme", 
      name: "Priya Sharma",
      email: "buyer2@test.com",
      phone: "+91-9876543211",
      companyName: "Sharma Textiles",
      industry: "textiles",
      subIndustry: "spinning-weaving",
      location: "Surat, Gujarat",
      passwordHash: hashedPassword
    });

    const seller1 = await User.create({
      role: "supplier",
      name: "Amit Patel",
      email: "seller1@test.com", 
      phone: "+91-9876543212",
      companyName: "Patel Machinery Works",
      industry: "manufacturing",
      subIndustry: "machinery-equipment",
      location: "Pune, Maharashtra",
      gstin: "27ABCDE1234F1Z5",
      passwordHash: hashedPassword
    });

    const seller2 = await User.create({
      role: "supplier",
      name: "Sunita Gupta",
      email: "seller2@test.com",
      phone: "+91-9876543213", 
      companyName: "Gupta Industrial Solutions",
      industry: "manufacturing",
      subIndustry: "automation-systems",
      location: "Chennai, Tamil Nadu",
      gstin: "33FGHIJ5678K2L9",
      passwordHash: hashedPassword
    });

    console.log("Created test users:");
    console.log("MSMEs (Buyers): buyer1@test.com, buyer2@test.com");
    console.log("Suppliers: seller1@test.com, seller2@test.com");
    console.log("Password for all: password123");

    // Create industries
    const industries = [
      {
        name: "Food Processing",
        slug: "food-processing",
        description: "Food manufacturing and processing equipment",
        subIndustries: [
          { name: "Packaging & Labeling", slug: "packaging-labeling" },
          { name: "Dairy Processing", slug: "dairy-processing" },
          { name: "Grain Processing", slug: "grain-processing" }
        ]
      },
      {
        name: "Textiles",
        slug: "textiles", 
        description: "Textile manufacturing and processing",
        subIndustries: [
          { name: "Spinning & Weaving", slug: "spinning-weaving" },
          { name: "Dyeing & Printing", slug: "dyeing-printing" },
          { name: "Garment Manufacturing", slug: "garment-manufacturing" }
        ]
      },
      {
        name: "Manufacturing",
        slug: "manufacturing",
        description: "General manufacturing and industrial equipment",
        subIndustries: [
          { name: "Machinery & Equipment", slug: "machinery-equipment" },
          { name: "Automation Systems", slug: "automation-systems" },
          { name: "Quality Control", slug: "quality-control" }
        ]
      }
    ];

    await Industry.insertMany(industries);
    console.log("Created industries and sub-industries");

    // Create machines owned by sellers
    const machines = [
      {
        name: "Automatic Packaging Machine APM-2000",
        slug: "automatic-packaging-machine-apm-2000",
        description: "High-speed automatic packaging machine for food products with advanced sealing technology and quality control systems.",
        industrySlug: "food-processing",
        subIndustrySlug: "packaging-labeling", 
        ownerUserId: seller1._id,
        manufacturer: "Patel Machinery Works",
        verified: true,
        features: ["High-speed operation", "Automatic sealing", "Quality sensors", "Easy maintenance"],
        specs: [
          { key: "Speed", value: "120 packs/minute" },
          { key: "Power", value: "5 KW" },
          { key: "Dimensions", value: "2000x1500x1800 mm" }
        ],
        photos: ["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500"],
        minOrderQty: "1 unit",
        leadTimeDays: "30-45"
      },
      {
        name: "Industrial Labeling System ILS-500",
        slug: "industrial-labeling-system-ils-500", 
        description: "Precision labeling system for bottles, cans, and containers with automatic feeding and positioning.",
        industrySlug: "food-processing",
        subIndustrySlug: "packaging-labeling",
        ownerUserId: seller1._id,
        manufacturer: "Patel Machinery Works", 
        verified: true,
        features: ["Precision positioning", "Multiple label sizes", "Automatic feeding", "Touch screen control"],
        specs: [
          { key: "Label Width", value: "10-150 mm" },
          { key: "Speed", value: "200 labels/minute" },
          { key: "Power", value: "2 KW" }
        ],
        photos: ["https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=500"],
        minOrderQty: "1 unit", 
        leadTimeDays: "20-30"
      },
      {
        name: "Textile Spinning Machine TSM-1200",
        slug: "textile-spinning-machine-tsm-1200",
        description: "Advanced spinning machine for cotton and synthetic fibers with computerized control system.",
        industrySlug: "textiles",
        subIndustrySlug: "spinning-weaving",
        ownerUserId: seller2._id,
        manufacturer: "Gupta Industrial Solutions",
        verified: true,
        features: ["Computerized control", "Multi-fiber compatibility", "Energy efficient", "Low maintenance"],
        specs: [
          { key: "Spindles", value: "1200" },
          { key: "Speed", value: "18000 RPM" },
          { key: "Power", value: "150 KW" }
        ],
        photos: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"],
        minOrderQty: "1 unit",
        leadTimeDays: "60-90"
      },
      {
        name: "Automated Weaving Loom AWL-800",
        slug: "automated-weaving-loom-awl-800",
        description: "High-efficiency weaving loom with automatic pattern control and fabric quality monitoring.",
        industrySlug: "textiles", 
        subIndustrySlug: "spinning-weaving",
        ownerUserId: seller2._id,
        manufacturer: "Gupta Industrial Solutions",
        verified: true,
        features: ["Pattern automation", "Quality monitoring", "High efficiency", "User-friendly interface"],
        specs: [
          { key: "Width", value: "800 mm" },
          { key: "Speed", value: "750 picks/minute" },
          { key: "Power", value: "25 KW" }
        ],
        photos: ["https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500"],
        minOrderQty: "1 unit",
        leadTimeDays: "45-60"
      },
      {
        name: "CNC Milling Machine CNM-3000",
        slug: "cnc-milling-machine-cnm-3000",
        description: "Precision CNC milling machine for manufacturing components with high accuracy and repeatability.",
        industrySlug: "manufacturing",
        subIndustrySlug: "machinery-equipment",
        ownerUserId: seller1._id,
        manufacturer: "Patel Machinery Works",
        verified: false, // Pending verification
        features: ["High precision", "CNC control", "Tool changer", "Coolant system"],
        specs: [
          { key: "Table Size", value: "1000x500 mm" },
          { key: "Spindle Speed", value: "8000 RPM" },
          { key: "Power", value: "15 KW" }
        ],
        photos: ["https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=500"],
        minOrderQty: "1 unit",
        leadTimeDays: "90-120"
      }
    ];

    await Machine.insertMany(machines);
    console.log("Created machines connected to sellers");

    console.log("\\n=== DATABASE RESET COMPLETE ===");
    console.log("\\nTest Credentials:");
    console.log("Buyer 1: buyer1@test.com / password123");
    console.log("Buyer 2: buyer2@test.com / password123"); 
    console.log("Seller 1: seller1@test.com / password123");
    console.log("Seller 2: seller2@test.com / password123");
    console.log("\\nAll machines are now connected to sellers!");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

resetAndSeed();
