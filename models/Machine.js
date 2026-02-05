const mongoose = require("mongoose");

const SpecSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const MachineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    industrySlug: { type: String, required: true, trim: true },
    subIndustrySlug: { type: String, required: true, trim: true },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    manufacturer: { type: String, trim: true },
    verified: { type: Boolean, default: false },
    features: [{ type: String, trim: true }],
    specs: [SpecSchema],
    photos: [{ type: String, trim: true }],
    minOrderQty: { type: String, trim: true },
    leadTimeDays: { type: String, trim: true },
    condition: {
      type: String,
      enum: ["new", "used", "refurbished"],
      default: "new"
    },
    priceRange: { type: String, trim: true },
    warrantyMonths: { type: Number, min: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Machine || mongoose.model("Machine", MachineSchema);
