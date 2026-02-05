const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const dbConnect = require("../config/db");
const User = require("../models/User");
const Industry = require("../models/Industry");
const Machine = require("../models/Machine");
const SavedMachine = require("../models/SavedMachine");
const Lead = require("../models/Lead");
const Wishlist = require("../models/Wishlist");
const MachineRequest = require("../models/MachineRequest");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const MachineVerification = require("../models/MachineVerification");

const app = express();
app.set("trust proxy", 1);

const SESSION_COOKIE = "induslink_session";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const ADMIN_KEY = process.env.ADMIN_KEY || "";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === "production";
const defaultOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  : defaultOrigins;
const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (!isProduction && localhostOriginPattern.test(origin)) {
        return callback(null, true);
      }
      if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
// Allow slightly larger payloads (e.g. compressed base64 images for machine photos).
app.use(express.json({ limit: "15mb" }));

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isBuyerRole(role) {
  return role === "buyer" || role === "msme";
}

function rolesMatch(requiredRole, userRole) {
  if (!requiredRole || !userRole) return false;
  if (requiredRole === userRole) return true;
  if (isBuyerRole(requiredRole) && isBuyerRole(userRole)) return true;
  return false;
}

function validateRequired(body, fields) {
  const missing = fields.filter((field) => !String(body[field] || "").trim());
  return missing;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCookies(req) {
  const cookieHeader = req.headers.cookie || "";
  return cookieHeader.split(";").reduce((acc, part) => {
    const [key, ...rest] = part.split("=");
    if (!key) return acc;
    acc[key.trim()] = decodeURIComponent(rest.join("=").trim());
    return acc;
  }, {});
}

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, JWT_SECRET, {
    expiresIn: "7d"
  });
}

function setAuthCookie(res, token) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: COOKIE_MAX_AGE,
    path: "/"
  });
}

function clearAuthCookie(res) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

async function getUserFromRequest(req) {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    await dbConnect();
    const user = await User.findById(payload.sub);
    return user || null;
  } catch (error) {
    return null;
  }
}

async function requireAuth(req, res, next) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  req.user = user;
  return next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || !rolesMatch(role, req.user.role)) {
      return res.status(403).json({ error: "Forbidden." });
    }
    return next();
  };
}

function requireAdminKey(req, res, next) {
  if (!ADMIN_KEY) {
    return res.status(500).json({ error: "ADMIN_KEY is not configured on the server." });
  }
  const key = req.headers["x-admin-key"];
  if (!key || key !== ADMIN_KEY) {
    return res.status(403).json({ error: "Forbidden." });
  }
  return next();
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "induslink-api" });
});

app.get("/api/industries", async (_req, res) => {
  try {
    await dbConnect();
    const industries = await Industry.find({}).sort({ name: 1 }).lean();
    res.json({ data: industries });
  } catch (error) {
    res.status(500).json({ error: "Failed to load industries." });
  }
});

app.get("/api/industries/:slug", async (req, res) => {
  try {
    await dbConnect();
    const industry = await Industry.findOne({ slug: req.params.slug }).lean();
    if (!industry) {
      return res.status(404).json({ error: "Industry not found." });
    }
    res.json({ data: industry });
  } catch (error) {
    res.status(500).json({ error: "Failed to load industry." });
  }
});

app.get("/api/machines", async (req, res) => {
  try {
    await dbConnect();
    const filters = {};
    if (req.query.industry) {
      filters.industrySlug = String(req.query.industry);
    }
    if (req.query.subIndustry) {
      filters.subIndustrySlug = String(req.query.subIndustry);
    }
    if (req.query.verified === "true") {
      filters.verified = true;
    }

    const machines = await Machine.find(filters).sort({ createdAt: -1 }).lean();
    res.json({ data: machines });
  } catch (error) {
    res.status(500).json({ error: "Failed to load machines." });
  }
});

app.get("/api/machines/:id", async (req, res) => {
  try {
    await dbConnect();
    const orFilters = [{ slug: req.params.id }];
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      orFilters.unshift({ _id: req.params.id });
    }

    const machine = await Machine.findOne({ $or: orFilters }).lean();
    if (!machine) {
      return res.status(404).json({ error: "Machine not found." });
    }
    res.json({ data: machine });
  } catch (error) {
    res.status(500).json({ error: "Failed to load machine." });
  }
});

app.post("/api/auth/register-buyer", async (req, res) => {
  try {
    await dbConnect();

    const payload = {
      name: req.body.name,
      email: normalizeEmail(req.body.email),
      phone: req.body.phone,
      industry: req.body.industry,
      subIndustry: req.body.subIndustry,
      location: req.body.location
    };

    const missing = validateRequired(payload, ["name", "email", "phone"]);
    if (missing.length) {
      return res.status(400).json({ error: "Missing required fields.", missing });
    }

    if (!req.body.password || String(req.body.password).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: payload.email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(String(req.body.password), 10);

    const user = await User.create({
      ...payload,
      passwordHash,
      role: "buyer"
    });

    const token = signToken(user);
    setAuthCookie(res, token);
    res.status(201).json({ data: user });
  } catch (error) {
    res.status(500).json({ error: "Registration failed." });
  }
});

app.post("/api/auth/register-msme", async (req, res) => {
  try {
    await dbConnect();

    const payload = {
      name: req.body.name,
      email: normalizeEmail(req.body.email),
      phone: req.body.phone,
      industry: req.body.industry,
      subIndustry: req.body.subIndustry,
      location: req.body.location
    };

    const missing = validateRequired(payload, ["name", "email", "phone"]);
    if (missing.length) {
      return res.status(400).json({ error: "Missing required fields.", missing });
    }

    if (!req.body.password || String(req.body.password).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: payload.email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(String(req.body.password), 10);

    const user = await User.create({
      ...payload,
      passwordHash,
      role: "msme"
    });

    const token = signToken(user);
    setAuthCookie(res, token);
    res.status(201).json({ data: user });
  } catch (error) {
    res.status(500).json({ error: "Registration failed." });
  }
});

app.post("/api/auth/register-supplier", async (req, res) => {
  try {
    await dbConnect();

    const payload = {
      name: req.body.name,
      email: normalizeEmail(req.body.email),
      phone: req.body.phone,
      companyName: req.body.companyName,
      industry: req.body.industry,
      subIndustry: req.body.subIndustry,
      location: req.body.location,
      gstin: req.body.gstin
    };

    const missing = validateRequired(payload, ["name", "email", "phone", "companyName"]);
    if (missing.length) {
      return res.status(400).json({ error: "Missing required fields.", missing });
    }

    if (!req.body.password || String(req.body.password).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: payload.email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(String(req.body.password), 10);

    const user = await User.create({
      ...payload,
      passwordHash,
      role: "supplier"
    });

    const token = signToken(user);
    setAuthCookie(res, token);
    res.status(201).json({ data: user });
  } catch (error) {
    res.status(500).json({ error: "Registration failed." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    await dbConnect();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    const role = req.body.role ? String(req.body.role) : null;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    if (role && !rolesMatch(role, user.role)) {
      return res.status(403).json({ error: "Role mismatch." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({ data: user });
  } catch (error) {
    res.status(500).json({ error: "Login failed." });
  }
});

app.get("/api/auth/me", async (req, res) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  return res.json({ data: user });
});

app.post("/api/auth/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ status: "ok" });
});

app.get("/api/buyer/saved", requireAuth, requireRole("buyer"), async (req, res) => {
  try {
    await dbConnect();
    const saved = await SavedMachine.find({ buyerId: req.user._id })
      .populate("machineId")
      .sort({ createdAt: -1 })
      .lean();
    const machines = saved.map((entry) => entry.machineId).filter(Boolean);
    res.json({ data: machines });
  } catch (error) {
    res.status(500).json({ error: "Failed to load saved machines." });
  }
});

app.get("/api/buyer/saved/:machineId", requireAuth, requireRole("buyer"), async (req, res) => {
  try {
    await dbConnect();
    const exists = await SavedMachine.exists({
      buyerId: req.user._id,
      machineId: req.params.machineId
    });
    res.json({ data: { saved: Boolean(exists) } });
  } catch (error) {
    res.status(500).json({ error: "Failed to check saved status." });
  }
});

app.post("/api/buyer/saved", requireAuth, requireRole("buyer"), async (req, res) => {
  try {
    await dbConnect();
    const machineId = String(req.body.machineId || "");
    if (!mongoose.Types.ObjectId.isValid(machineId)) {
      return res.status(400).json({ error: "Valid machineId is required." });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ error: "Machine not found." });
    }

    const saved = await SavedMachine.create({
      buyerId: req.user._id,
      machineId
    });

    res.status(201).json({ data: saved });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ data: { alreadySaved: true } });
    }
    res.status(500).json({ error: "Failed to save machine." });
  }
});

app.delete("/api/buyer/saved/:machineId", requireAuth, requireRole("buyer"), async (req, res) => {
  try {
    await dbConnect();
    await SavedMachine.deleteOne({
      buyerId: req.user._id,
      machineId: req.params.machineId
    });
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove saved machine." });
  }
});

app.post("/api/buyer/lead", requireAuth, requireRole("buyer"), async (req, res) => {
  try {
    await dbConnect();
    const machineId = String(req.body.machineId || "");
    const message = String(req.body.message || "").trim();

    if (!mongoose.Types.ObjectId.isValid(machineId)) {
      return res.status(400).json({ error: "Valid machineId is required." });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ error: "Machine not found." });
    }

    const lead = await Lead.create({
      buyerId: req.user._id,
      msmeId: machine.ownerUserId || null,
      machineId,
      message
    });

    res.status(201).json({ data: lead });
  } catch (error) {
    res.status(500).json({ error: "Failed to create lead." });
  }
});

app.get("/api/supplier/leads", requireAuth, requireRole("supplier"), async (req, res) => {
  try {
    await dbConnect();
    const machines = await Machine.find({ ownerUserId: req.user._id }).select("_id").lean();
    const machineIds = machines.map((machine) => machine._id);
    if (!machineIds.length) {
      return res.json({ data: [] });
    }

    const leads = await Lead.find({ machineId: { $in: machineIds } })
      .populate("buyerId", "name email companyName")
      .populate("machineId", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ data: leads });
  } catch (error) {
    res.status(500).json({ error: "Failed to load leads." });
  }
});

app.get("/api/supplier/machines", requireAuth, requireRole("supplier"), async (req, res) => {
  try {
    await dbConnect();
    const machines = await Machine.find({ ownerUserId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ data: machines });
  } catch (error) {
    res.status(500).json({ error: "Failed to load machines." });
  }
});

app.post("/api/supplier/machines", requireAuth, requireRole("supplier"), async (req, res) => {
  try {
    await dbConnect();
    const payload = {
      name: String(req.body.name || "").trim(),
      description: String(req.body.description || "").trim(),
      industrySlug: String(req.body.industrySlug || "").trim(),
      subIndustrySlug: String(req.body.subIndustrySlug || "").trim(),
      manufacturer: String(req.body.manufacturer || "").trim(),
      features: Array.isArray(req.body.features) ? req.body.features : [],
      specs: Array.isArray(req.body.specs) ? req.body.specs : [],
      photos: Array.isArray(req.body.photos) ? req.body.photos : [],
      minOrderQty: String(req.body.minOrderQty || "").trim(),
      leadTimeDays: String(req.body.leadTimeDays || "").trim(),
      condition: String(req.body.condition || "").trim(),
      priceRange: String(req.body.priceRange || "").trim(),
      warrantyMonths: req.body.warrantyMonths
    };

    const normalizedCondition = ["new", "used", "refurbished"].includes(payload.condition)
      ? payload.condition
      : "new";

    const warrantyMonthsValue =
      payload.warrantyMonths === "" || payload.warrantyMonths == null
        ? null
        : Number(payload.warrantyMonths);
    const normalizedWarrantyMonths = Number.isFinite(warrantyMonthsValue) ? warrantyMonthsValue : null;

    const missing = validateRequired(payload, ["name", "description", "industrySlug", "subIndustrySlug"]);
    if (missing.length) {
      return res.status(400).json({ error: "Missing required fields.", missing });
    }

    const baseSlug = slugify(payload.name);
    let slug = baseSlug || `machine-${Date.now()}`;
    let suffix = 1;
    while (await Machine.exists({ slug })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const machine = await Machine.create({
      ...payload,
      condition: normalizedCondition,
      warrantyMonths: normalizedWarrantyMonths,
      slug,
      manufacturer: payload.manufacturer || req.user.companyName || "",
      features: payload.features.filter((item) => String(item || "").trim()),
      photos: payload.photos.filter((item) => String(item || "").trim()),
      specs: payload.specs
        .filter((spec) => spec && spec.key && spec.value)
        .map((spec) => ({ key: String(spec.key).trim(), value: String(spec.value).trim() })),
      ownerUserId: req.user._id,
      verified: false
    });

    res.status(201).json({ data: machine });
  } catch (error) {
    res.status(500).json({ error: "Failed to create machine." });
  }
});

// ===== WISHLIST ENDPOINTS =====
app.post("/api/msme/wishlist", requireAuth, requireRole("msme"), async (req, res) => {
  try {
    await dbConnect();
    const { machineId } = req.body;
    if (!machineId) {
      return res.status(400).json({ error: "machineId required." });
    }
    const wishlist = await Wishlist.create({
      buyerId: req.user._id,
      machineId
    });
    res.status(201).json({ data: wishlist });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Machine already in wishlist." });
    }
    res.status(500).json({ error: "Failed to add to wishlist." });
  }
});

app.get("/api/msme/wishlist", requireAuth, requireRole("msme"), async (req, res) => {
  try {
    await dbConnect();
    const wishlist = await Wishlist.find({ buyerId: req.user._id })
      .populate("machineId")
      .sort({ addedAt: -1 })
      .lean();
    res.json({ data: wishlist });
  } catch (error) {
    res.status(500).json({ error: "Failed to load wishlist." });
  }
});

app.delete("/api/msme/wishlist/:machineId", requireAuth, requireRole("msme"), async (req, res) => {
  try {
    await dbConnect();
    await Wishlist.deleteOne({ buyerId: req.user._id, machineId: req.params.machineId });
    res.json({ message: "Removed from wishlist." });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove from wishlist." });
  }
});

// ===== MACHINE REQUEST ENDPOINTS (MSME requests a machine, supplier receives) =====
app.post("/api/msme/request-machine", requireAuth, requireRole("msme"), async (req, res) => {
  try {
    await dbConnect();
    const { machineId, buyerMessage } = req.body;
    if (!machineId) {
      return res.status(400).json({ error: "machineId required." });
    }
    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ error: "Machine not found." });
    }
    const sellerId = machine.ownerUserId;
    if (!sellerId) {
      return res.status(400).json({ error: "Seller not found for this machine." });
    }

    const request = await MachineRequest.create({
      buyerId: req.user._id,
      machineId,
      sellerId,
      status: "pending",
      buyerMessage: buyerMessage || ""
    });

    // Create an initial message so the conversation exists immediately.
    const initialContent = String(buyerMessage || "").trim()
      || "Hi! I'm interested in this machine. Please share pricing, MOQ, and delivery timeline.";

    await Message.create({
      senderId: req.user._id,
      recipientId: sellerId,
      machineRequestId: request._id,
      content: initialContent,
      senderRole: "buyer"
    });

    const buyerLabel = req.user.companyName || req.user.name || req.user.email || "A buyer";

    // Create notification for seller
    await Notification.create({
      userId: sellerId,
      type: "request_received",
      title: "New Machine Request",
      message: `${buyerLabel} has requested your machine.`,
      relatedId: request._id
    });

    res.status(201).json({ data: request, message: "Seller has been contacted and will reach you soon!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to request machine." });
  }
});

app.get("/api/msme/requests", requireAuth, requireRole("msme"), async (req, res) => {
  try {
    await dbConnect();
    const requests = await MachineRequest.find({ buyerId: req.user._id })
      .populate("machineId", "name slug")
      .populate("sellerId", "name companyName email phone role")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: requests });
  } catch (error) {
    res.status(500).json({ error: "Failed to load requests." });
  }
});

// ===== SELLER MACHINE REQUEST MANAGEMENT =====
app.get("/api/supplier/requests", requireAuth, requireRole("supplier"), async (req, res) => {
  try {
    await dbConnect();
    const machines = await Machine.find({ ownerUserId: req.user._id }).select("_id").lean();
    const machineIds = machines.map((machine) => machine._id);
    const requests = await MachineRequest.find({ machineId: { $in: machineIds } })
      .populate("buyerId", "name companyName email phone role")
      .populate("machineId", "name slug")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: requests });
  } catch (error) {
    res.status(500).json({ error: "Failed to load requests." });
  }
});

app.patch("/api/supplier/requests/:requestId", requireAuth, requireRole("supplier"), async (req, res) => {
  try {
    await dbConnect();
    const { status } = req.body;
    if (!["approved", "rejected", "contacted"].includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }
    const request = await MachineRequest.findByIdAndUpdate(req.params.requestId, { status }, { new: true })
      .populate("buyerId", "name companyName email phone role");
    if (!request) {
      return res.status(404).json({ error: "Request not found." });
    }

    // Create notification for buyer
    const notifType = status === "approved" ? "request_approved" : status === "rejected" ? "request_rejected" : "new_message";
    const notifMessage = status === "approved" ? "Your machine request has been approved!" : status === "rejected" ? "Your machine request has been rejected." : "Seller has contacted you!";

    await Notification.create({
      userId: request.buyerId._id,
      type: notifType,
      title: status === "approved" ? "Request Approved" : status === "rejected" ? "Request Rejected" : "Seller Contacted",
      message: notifMessage,
      relatedId: request._id
    });

    res.json({ data: request, message: `Request ${status}.` });
  } catch (error) {
    res.status(500).json({ error: "Failed to update request." });
  }
});

// ===== NOTIFICATIONS =====
app.get("/api/notifications", requireAuth, async (req, res) => {
  try {
    await dbConnect();
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ priority: -1, createdAt: -1 })
      .lean();
    res.json({ data: notifications });
  } catch (error) {
    res.status(500).json({ error: "Failed to load notifications." });
  }
});

app.patch("/api/notifications/:notificationId/read", requireAuth, async (req, res) => {
  try {
    await dbConnect();
    const notification = await Notification.findByIdAndUpdate(req.params.notificationId, { read: true }, { new: true });
    res.json({ data: notification });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark notification as read." });
  }
});

// ===== MESSAGING =====
app.post("/api/messages", requireAuth, async (req, res) => {
  try {
    await dbConnect();
    const { recipientId, content, machineRequestId } = req.body;
    if (!recipientId || !content) {
      return res.status(400).json({ error: "recipientId and content required." });
    }
    const message = await Message.create({
      senderId: req.user._id,
      recipientId,
      content,
      machineRequestId: machineRequestId || null,
      senderRole: isBuyerRole(req.user.role) ? "buyer" : "supplier"
    });

    const senderLabel = req.user.companyName || req.user.name || req.user.email || "A user";

    // Create notification for recipient
    await Notification.create({
      userId: recipientId,
      type: "new_message",
      title: "New Message",
      message: `${senderLabel} sent you a message.`,
      relatedId: message._id
    });

    res.status(201).json({ data: message });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message." });
  }
});

app.get("/api/messages/:userId", requireAuth, async (req, res) => {
  try {
    await dbConnect();
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, recipientId: req.params.userId },
        { senderId: req.params.userId, recipientId: req.user._id }
      ]
    })
      .populate("senderId", "name companyName email phone role")
      .populate("recipientId", "name companyName email phone role")
      .sort({ createdAt: 1 })
      .lean();
    res.json({ data: messages });
  } catch (error) {
    res.status(500).json({ error: "Failed to load messages." });
  }
});

app.get("/api/conversations", requireAuth, async (req, res) => {
  try {
    await dbConnect();
    // Get unique conversations (most recent message per user)
    const messages = await Message.find({
      $or: [{ senderId: req.user._id }, { recipientId: req.user._id }]
    })
      .sort({ createdAt: -1 })
      .lean();

    const conversationMap = {};
    messages.forEach((msg) => {
      const otherId = msg.senderId.toString() === req.user._id.toString() ? msg.recipientId : msg.senderId;
      const otherIdStr = otherId.toString();
      if (!conversationMap[otherIdStr]) {
        conversationMap[otherIdStr] = msg;
      }
    });

    const conversations = Object.values(conversationMap);
    const conversationsWithUsers = await Promise.all(
      conversations.map(async (conv) => {
        const otherId = conv.senderId.toString() === req.user._id.toString() ? conv.recipientId : conv.senderId;
        const user = await User.findById(otherId).select("name companyName email phone role").lean();
        return { ...conv, otherUser: user };
      })
    );

    res.json({ data: conversationsWithUsers });
  } catch (error) {
    res.status(500).json({ error: "Failed to load conversations." });
  }
});

// ===== MACHINE VERIFICATION (Suppliers add machines to be verified) =====
app.post("/api/supplier/verify-machine", requireAuth, requireRole("supplier"), async (req, res) => {
  try {
    await dbConnect();
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    
    const payload = {
      name: String(req.body.name || "").trim(),
      description: String(req.body.description || "").trim(),
      manufacturer: String(req.body.manufacturer || "").trim(),
      industrySlug: String(req.body.industrySlug || "").trim(),
      subIndustrySlug: String(req.body.subIndustrySlug || "").trim(),
      features: Array.isArray(req.body.features) ? req.body.features : [],
      specs: Array.isArray(req.body.specs) ? req.body.specs : [],
      photos: Array.isArray(req.body.photos) ? req.body.photos : [],
      minOrderQty: String(req.body.minOrderQty || "").trim(),
      leadTimeDays: String(req.body.leadTimeDays || "").trim(),
      condition: String(req.body.condition || "").trim(),
      priceRange: String(req.body.priceRange || "").trim(),
      warrantyMonths: req.body.warrantyMonths
    };

    console.log('Processed payload:', JSON.stringify(payload, null, 2));

    const normalizedCondition = ["new", "used", "refurbished"].includes(payload.condition)
      ? payload.condition
      : "new";

    const warrantyMonthsValue =
      payload.warrantyMonths === "" || payload.warrantyMonths == null
        ? null
        : Number(payload.warrantyMonths);
    const normalizedWarrantyMonths = Number.isFinite(warrantyMonthsValue) ? warrantyMonthsValue : null;

    // Validate required fields
    const errors = [];
    if (!payload.name || payload.name.length < 2) errors.push("Machine name must be at least 2 characters");
    if (!payload.description || payload.description.length < 5) errors.push("Description must be at least 5 characters");
    if (!payload.manufacturer || payload.manufacturer.length < 2) errors.push("Manufacturer must be at least 2 characters");
    if (!payload.industrySlug) errors.push("Industry is required");
    if (!payload.subIndustrySlug) errors.push("Sub-industry is required");

    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    // Generate unique slug
    const slug = `machine-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log('Creating machine with data:', { ...payload, slug, sellerId: req.user._id });

    const verification = await MachineVerification.create({
      ...payload,
      condition: normalizedCondition,
      warrantyMonths: normalizedWarrantyMonths,
      slug,
      sellerId: req.user._id,
      status: "pending",
      features: payload.features.filter((item) => String(item || "").trim().length > 0),
      photos: payload.photos.filter((item) => String(item || "").trim().length > 0),
      specs: payload.specs
        .filter((spec) => spec && spec.key && spec.value)
        .map((spec) => ({ key: String(spec.key).trim(), value: String(spec.value).trim() }))
    });

    res.status(201).json({ data: verification, message: "Machine submitted for verification." });
  } catch (error) {
    console.error('Machine verification error:', error);
    
    // Extract validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(field => 
        `${field}: ${error.errors[field].message}`
      );
      console.log('Validation error details:', validationErrors);
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validationErrors,
        fullError: error.message 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to submit machine.", 
      details: error.message,
      fullError: error.toString()
    });
  }
});

app.get("/api/supplier/verify-machines", requireAuth, requireRole("supplier"), async (req, res) => {
  try {
    await dbConnect();
    const machines = await MachineVerification.find({ sellerId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: machines });
  } catch (error) {
    res.status(500).json({ error: "Failed to load verification machines." });
  }
});

app.delete("/api/supplier/verify-machines/:machineId", requireAuth, requireRole("supplier"), async (req, res) => {
  try {
    await dbConnect();
    const machine = await MachineVerification.findById(req.params.machineId);
    if (!machine || machine.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized." });
    }
    if (machine.status !== "pending") {
      return res.status(400).json({ error: "Can only delete pending verifications." });
    }
    await MachineVerification.deleteOne({ _id: req.params.machineId });
    res.json({ message: "Machine verification deleted." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete machine verification." });
  }
});

app.post("/api/supplier/verify-machines/:machineId/message", requireAuth, requireRole("supplier"), async (req, res) => {
  try {
    await dbConnect();
    const verification = await MachineVerification.findById(req.params.machineId);
    if (!verification || verification.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized." });
    }

    const content = String(req.body.content || "").trim();
    if (!content) {
      return res.status(400).json({ error: "content is required." });
    }

    verification.messages = Array.isArray(verification.messages) ? verification.messages : [];
    verification.messages.push({ sender: "seller", content, priority: false });
    await verification.save();

    res.status(201).json({ data: verification, message: "Reply sent to admin." });
  } catch (error) {
    res.status(500).json({ error: "Failed to send reply.", details: error.message });
  }
});

// ===== ADMIN: APPROVE / REJECT MACHINE VERIFICATIONS =====
app.get("/api/admin/verify-machines", requireAdminKey, async (req, res) => {
  try {
    await dbConnect();
    const filters = {};
    if (req.query.status) {
      filters.status = String(req.query.status);
    }

    const verifications = await MachineVerification.find(filters)
      .populate("sellerId", "name companyName email phone location gstin industry subIndustry")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ data: verifications });
  } catch (error) {
    res.status(500).json({ error: "Failed to load verification queue." });
  }
});

app.post("/api/admin/verify-machines/:verificationId/message", requireAdminKey, async (req, res) => {
  try {
    await dbConnect();
    const verification = await MachineVerification.findById(req.params.verificationId);
    if (!verification) {
      return res.status(404).json({ error: "Verification not found." });
    }

    const content = String(req.body.content || "").trim();
    if (!content) {
      return res.status(400).json({ error: "content is required." });
    }

    const priority = req.body.priority === false ? false : true;

    verification.messages = Array.isArray(verification.messages) ? verification.messages : [];
    verification.messages.push({ sender: "admin", content, priority });
    await verification.save();

    const messagePreview = content.length > 220 ? `${content.slice(0, 220)}…` : content;

    await Notification.create({
      userId: verification.sellerId,
      type: "admin_question",
      priority,
      title: priority ? "Priority: Admin Question" : "Admin Question",
      message: messagePreview,
      relatedId: verification._id
    });

    res.status(201).json({ data: verification, message: "Question sent to seller." });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message.", details: error.message });
  }
});

app.patch("/api/admin/verify-machines/:verificationId", requireAdminKey, async (req, res) => {
  try {
    await dbConnect();
    const verification = await MachineVerification.findById(req.params.verificationId);
    if (!verification) {
      return res.status(404).json({ error: "Verification not found." });
    }

    const status = String(req.body.status || "").trim();
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }

    if (status === "rejected") {
      verification.status = "rejected";
      verification.rejectionReason = String(req.body.rejectionReason || "").trim();
      await verification.save();

      await Notification.create({
        userId: verification.sellerId,
        type: "machine_rejected",
        title: "Machine Rejected",
        message: `Your machine "${verification.name}" was rejected.${verification.rejectionReason ? ` Reason: ${verification.rejectionReason}` : ""}`,
        relatedId: verification._id
      });

      return res.json({ data: verification, message: "Machine verification rejected." });
    }

    if (verification.status === "approved") {
      return res.json({ data: verification, message: "Machine verification already approved." });
    }

    const baseSlug = slugify(verification.name);
    let slug = baseSlug || verification.slug || `machine-${Date.now()}`;
    let suffix = 1;
    while (await Machine.exists({ slug })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const machine = await Machine.create({
      name: verification.name,
      slug,
      description: verification.description,
      industrySlug: verification.industrySlug,
      subIndustrySlug: verification.subIndustrySlug,
      ownerUserId: verification.sellerId,
      manufacturer: verification.manufacturer,
      verified: true,
      features: Array.isArray(verification.features) ? verification.features : [],
      specs: Array.isArray(verification.specs) ? verification.specs : [],
      photos: Array.isArray(verification.photos) ? verification.photos : [],
      minOrderQty: verification.minOrderQty || "",
      leadTimeDays: verification.leadTimeDays || "",
      condition: verification.condition || "new",
      priceRange: verification.priceRange || "",
      warrantyMonths: verification.warrantyMonths ?? null
    });

    verification.status = "approved";
    verification.rejectionReason = "";
    verification.machineId = machine._id;
    await verification.save();

    await Notification.create({
      userId: verification.sellerId,
      type: "machine_verified",
      title: "Machine Verified",
      message: `Your machine "${verification.name}" has been verified and is now live.`,
      relatedId: machine._id
    });

    res.json({ data: { verification, machine }, message: "Machine verified and published." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update verification.", details: error.message });
  }
});

if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`API listening on ${port}`);
  });
}

module.exports = (req, res) => app(req, res);
