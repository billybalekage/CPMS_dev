const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config(); // Charge ton MONGO_URI et JWT_SECRET

// Importe ton modèle (vérifie bien le chemin vers ton dossier Models)
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    // 1. Connexion à la base de données
    console.log("Connexion à MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    // 2. Vérifier si l'admin existe déjà (pour éviter les doublons)
    const adminEmail = "billybalekage@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Un administrateur avec cet email existe déjà.");
      process.exit();
    }

    // 3. Hachage du mot de passe
    const password = "Admin@2026"; // Change ce mot de passe après ta première connexion !
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Création de l'objet Admin
    const firstAdmin = new User({
      fullName: "Super Administrateur BILLY BALEKAGE",
      email: adminEmail,
      password: hashedPassword,
      role: "admin", // <--- TRÈS IMPORTANT
      phone: "0000000000",
      isAcountVerified: false, // On le valide d'office
      status: "active",
      address: "Adresse du siège social", 
    });

    // 5. Sauvegarde
    await firstAdmin.save();

    console.log("-----------------------------------------------");
    console.log("SUCCESS : Premier Admin créé !");
    console.log(`Email : ${adminEmail}`);
    console.log(`Password : ${password}`);
    console.log("-----------------------------------------------");

    mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error("Erreur lors du seeding :", error);
    process.exit(1);
  }
};

seedAdmin();
