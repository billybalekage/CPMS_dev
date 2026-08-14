const mongoose = require("mongoose");
require("dotenv").config();
const UserModel = require("../models/User");

const cleanData = async () => {
  try {
    // 1. Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🛠️ Connecté à MongoDB pour le nettoyage...");
    const result = await User.deleteMany({ role: { $ne: "superAdmin" } });

    console.log(`✅ Nettoyage terminé !`);
    console.log(`🗑️ Nombre de documents supprimés : ${result.deletedCount}`);

    mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error("❌ Erreur lors de la suppression :", error);
    process.exit(1);
  }
};

cleanData();
