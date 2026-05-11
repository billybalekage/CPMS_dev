const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Veuillez fournir un email valide"],
    },

    profileImage: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },

    address: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      unique: true,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "accountant", "sales", "technician"],
      default: "technician",
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    isAccountVerified: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = UserModel;
