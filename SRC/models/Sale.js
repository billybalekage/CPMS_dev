const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
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
    rate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rate",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    credit: {
      type: Number,
      required: true,
    },
    token: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Token",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "mobile_money", "bank_transfer"],
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const SaleModel = mongoose.models.Sale || mongoose.model("Sale", saleSchema);

module.exports = SaleModel;
