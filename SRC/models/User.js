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
<<<<<<< HEAD
      enum: ["admin", "accountant", "sales", "technician"],
=======
      enum: ["admin", "accountant", "sales", "technician", "superAdmin"],
>>>>>>> dev
      default: "technician",
    },

    status: {
      type: String,
<<<<<<< HEAD
      enum: ["active", "blocked"],
=======
      enum: ["active", "inactive", "blocked"],
>>>>>>> dev
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

<<<<<<< HEAD
=======
userSchema.index({ role: 1, status: 1 });
userSchema.index({ createdAt: -1 });

>>>>>>> dev
const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = UserModel;
