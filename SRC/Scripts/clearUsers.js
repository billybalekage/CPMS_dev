const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User"); 

const clearAllUsers = async () => {
  try {
    // 1. Connexion
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connexion à MongoDB pour suppression TOTALE...");

    // Comptage avant suppression (pour savoir ce qu'on va perdre)
    const count = await User.countDocuments();

    if (count === 0) {
      console.log("La collection est déjà vide. Rien à supprimer.");
      process.exit();
    }

    console.log(`Attention : ${count} utilisateurs vont être supprimés.`);

    // L'Option A : Suppression de TOUS les documents
    const result = await User.deleteMany({});

    console.log("-----------------------------------------------");
    console.log(`SUCCÈS : La collection User a été vidée.`);
    console.log(`Documents supprimés : ${result.deletedCount}`);
    console.log("-----------------------------------------------");

    mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error("Erreur critique lors de la suppression :", error.message);
    process.exit(1);
  }
};

clearAllUsers();
