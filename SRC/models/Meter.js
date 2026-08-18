const mongoose = require("mongoose");

const meterSchema = new mongoose.Schema(
  {
    meterNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["unassigned", "assigned", "active", "inactive"],
      default: "unassigned",
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
    location: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

meterSchema.index({ status: 1, client: 1 });
meterSchema.index({ createdAt: -1 });

const MeterModel =
  mongoose.models.Meter || mongoose.model("Meter", meterSchema);

module.exports = MeterModel;
