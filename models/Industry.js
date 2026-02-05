const mongoose = require("mongoose");

const SubIndustrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, trim: true }
  },
  { _id: false }
);

const IndustrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    subIndustries: [SubIndustrySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.models.Industry || mongoose.model("Industry", IndustrySchema);
