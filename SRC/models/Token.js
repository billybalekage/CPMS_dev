const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
    },
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
    meterNumber: {
      type: String,
      required: true,
    },
    credit: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["unused", "used", "expired", "cancelled"],
      default: "unused",
    },
    usedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const TokenModel = mongoose.models.Token || mongoose.model("Token", tokenSchema);

module.exports = TokenModel;
