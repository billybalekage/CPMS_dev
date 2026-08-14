const { MongoClient } = require("mongodb");
require("dotenv").config();


const url = process.env.MONGO_URI
const client = new MongoClient(url);


const dbName = "cpms_db";
const collectionName = "User";

async function main() {
  try {
    
    await client.connect();
    console.log("Connecté avec succès au serveur MongoDB");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Récupérer toutes les données
    const donnees = await collection.find({}).toArray();

    console.log("--- Données stockées ---");
    console.table(donnees);
  } catch (e) {
    console.error("Erreur de connexion :", e);
  } finally {
    await client.close();
  }
}

main();
