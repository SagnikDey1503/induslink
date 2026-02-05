const mongoose = require("mongoose");

const machineRequestSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "contacted"],
      default: "pending"
    },
    buyerMessage: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.models.MachineRequest || mongoose.model("MachineRequest", machineRequestSchema);
