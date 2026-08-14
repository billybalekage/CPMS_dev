const mongoose = require("mongoose");
require("dotenv").config();

const MeterModel = require("../models/Meter");
const {
  getMeterPrefixByType,
  generateUniqueMeterNumber,
} = require("../utils/meterNumber");

const METER_TYPES = ["usine", "entreprise", "prive"];
const METERS_PER_TYPE = 20;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connecté");
  } catch (error) {
    console.error("Erreur de connexion MongoDB :", error.message);
    process.exit(1);
  }
};

const generateMetersForType = async (meterType) => {
  const prefix = getMeterPrefixByType(meterType);
  if (!prefix) {
    throw new Error(`Préfixe invalide pour le type ${meterType}`);
  }

  const createdMeters = [];

  for (let i = 0; i < METERS_PER_TYPE; i += 1) {
    const meterNumber = await generateUniqueMeterNumber(
      prefix,
      async (candidate) => {
        return Boolean(await MeterModel.exists({ meterNumber: candidate }));
      },
    );

    const meter = new MeterModel({ meterNumber, status: "unassigned" });
    await meter.save();
    createdMeters.push(meterNumber);
    console.log(`✔ Meter créé: ${meterNumber}`);
  }

  return createdMeters;
};

const run = async () => {
  try {
    await connectDB();
    console.log(
      `Démarrage de la génération de ${METERS_PER_TYPE} compteurs par type...`,
    );

    for (const meterType of METER_TYPES) {
      console.log(`
Génération des compteurs pour le type: ${meterType}`);
      const created = await generateMetersForType(meterType);
      console.log(`✅ ${created.length} compteurs créés pour ${meterType}`);
    }

    console.log("Génération terminée.");
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(
      "Erreur pendant la génération des compteurs :",
      error.message,
    );
    mongoose.connection.close();
    process.exit(1);
  }
};

run();
