const mongoose = require("mongoose");

const rateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    credit: {
      type: Number,
      required: true,
    },
    clientType: {
      type: String,
      enum: ["prive", "entreprise", "usine"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const RateModel = mongoose.models.Rate || mongoose.model("Rate", rateSchema);

module.exports = RateModel;
