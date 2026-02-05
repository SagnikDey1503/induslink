const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    msmeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
