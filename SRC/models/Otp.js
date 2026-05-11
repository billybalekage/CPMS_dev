const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Ou "Client" si applicable
      required: true,
    },
    type: {
      type: String,
      enum: ["email_verification", "reset_password", "phone_verification", "two_factor"],
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB supprimera automatiquement après expiration
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index pour optimiser les recherches
otpSchema.index({ userId: 1, type: 1 });

const OtpModel = mongoose.models.Otp || mongoose.model("Otp", otpSchema);

module.exports = OtpModel;