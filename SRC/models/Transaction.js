const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    meter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meter",
      required: true,
    },
    type: {
      type: String,
      enum: ["sale", "consumption", "recharge", "alert", "payment"],
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    credit: {
      type: Number,
      default: 0,
    },
    creditRemaining: {
      type: Number,
      default: 0,
    },
    creditConsumed: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "mobile_money", "bank_transfer"],
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed", "cancelled"],
      default: "completed",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Index pour les requêtes fréquentes
transactionSchema.index({ client: 1, createdAt: -1 });
transactionSchema.index({ meter: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });

const TransactionModel = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);

module.exports = TransactionModel;
