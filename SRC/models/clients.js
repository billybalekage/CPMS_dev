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
<<<<<<< HEAD
    meterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meter",
      required: true,
      unique: true,
    },
    meterNumber: { type: String, required: true, unique: true,  }, // numero du compteur
=======
    meter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meter",
      default: null,
    },
    meterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meter",
      default: null,
    },
    meterNumber: { type: String, required: true, unique: true },
>>>>>>> dev
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

<<<<<<< HEAD
const clientModel = mongoose.models.Client || mongoose.model("Client", clientSchema);

module.exports = clientModel;
=======
clientSchema.index({ email: 1 });
clientSchema.index({ clientType: 1, status: 1 });
clientSchema.index({ createdAt: -1 });

const clientModel =
  mongoose.models.Client || mongoose.model("Client", clientSchema);

module.exports = clientModel;
>>>>>>> dev
