const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Veuillez fournir un email valide"],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^\+?[1-9]\d{1,14}$/,
        "Veuillez fournir un numéro de téléphone valide",
      ],
    },
    address: { type: String, required: true },
    meterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meter",
      required: true,
      unique: true,
    },
    meterNumber: { type: String, required: true, unique: true,  }, // numero du compteur
    clientType: {
      type: String,
      enum: ["prive", "entreprise", "usine"],
      required: true,
    },
    status: {
      type: String,
      enum: ["actif", "inactif"],
      default: "actif",
    },
  },

  { timestamps: true },
);

const clientModel = mongoose.models.Client || mongoose.model("Client", clientSchema);

module.exports = clientModel;