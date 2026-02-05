const mongoose = require("mongoose");

const machineVerificationSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine" },
    name: { type: String, required: true, minlength: 2 },
    slug: { type: String, required: true, sparse: true },
    description: { type: String, required: true, minlength: 5 },
    manufacturer: { type: String, required: true, minlength: 2 },
    industrySlug: { type: String, required: true, minlength: 2 },
    subIndustrySlug: { type: String, required: true, minlength: 2 },
    features: [{ type: String, minlength: 2 }],
    specs: [
      {
        key: { type: String, minlength: 1 },
        value: { type: String, minlength: 1 }
      }
    ],
    photos: [{ type: String }],
    minOrderQty: { type: String },
    leadTimeDays: { type: String },
    condition: {
      type: String,
      enum: ["new", "used", "refurbished"],
      default: "new"
    },
    priceRange: { type: String },
    warrantyMonths: { type: Number, min: 0 },
    messages: [
      {
        sender: { type: String, enum: ["admin", "seller"], required: true },
        content: { type: String, required: true, trim: true },
        priority: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    rejectionReason: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Remove unique index if it exists
machineVerificationSchema.index({ slug: 1 }, { sparse: true });

module.exports = mongoose.models.MachineVerification || mongoose.model("MachineVerification", machineVerificationSchema);
