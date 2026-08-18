const mongoose = require("mongoose");
require("dotenv").config();
<<<<<<< HEAD
const User = require("../SRC/models/User"); // Ajuste le chemin vers ton modèle
=======
const UserModel = require("../models/User");
>>>>>>> dev

const cleanData = async () => {
  try {
    // 1. Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🛠️ Connecté à MongoDB pour le nettoyage...");
<<<<<<< HEAD

    // --- OPTION A : Supprimer TOUS les utilisateurs (Vider la table) ---
    // const result = await User.deleteMany({});

    // --- OPTION B : Supprimer selon un critère (Plus sûr) ---
    // Exemple : Supprimer tous les utilisateurs qui ne sont PAS admins
    const result = await User.deleteMany({ role: { $ne: "admin" } });
=======
    const result = await User.deleteMany({ role: { $ne: "superAdmin" } });
>>>>>>> dev

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
