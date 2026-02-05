const mongoose = require("mongoose");

const SavedMachineSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true }
  },
  { timestamps: true }
);

SavedMachineSchema.index({ buyerId: 1, machineId: 1 }, { unique: true });

module.exports = mongoose.models.SavedMachine || mongoose.model("SavedMachine", SavedMachineSchema);
