const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");

const seedAdmin = async () => {
  try {
    console.log("Connexion à MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    const adminEmail = "super@admin.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Un administrateur avec cet email existe déjà.");
      process.exit();
    }

    // 3. Hachage du mot de passe
    const password = "Admin@2026";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Création de l'objet Admin
    const firstAdmin = new User({
      fullName: "SuperAdmin",
      email: adminEmail,
      password: hashedPassword,
      role: "superAdmin", 
      phone: "0000000000",
      isAcountVerified: false, 
      status: "active",
      address: "Adresse du siège social", 
    });

    // 5. Sauvegarde
    await firstAdmin.save();
    mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error("Erreur lors du seeding :", error);
    process.exit(1);
  }
};

seedAdmin();
