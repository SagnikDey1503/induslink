const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true },
    addedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Ensure uniqueness: a buyer can't add the same machine twice
wishlistSchema.index({ buyerId: 1, machineId: 1 }, { unique: true });

module.exports = mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);
