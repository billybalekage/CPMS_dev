const { MongoClient } = require("mongodb");
require("dotenv").config();

<<<<<<< HEAD
// URL de connexion (Modifier avec vos accès)
const url = process.env.MONGO_URI
const client = new MongoClient(url);

// Nom de votre base de données et de votre collection
const dbName = "monEntreprise";
const collectionName = "employes";

async function main() {
  try {
    // Connexion au serveur
=======

const url = process.env.MONGO_URI
const client = new MongoClient(url);


const dbName = "cpms_db";
const collectionName = "User";

async function main() {
  try {
    
>>>>>>> dev
    await client.connect();
    console.log("Connecté avec succès au serveur MongoDB");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Récupérer toutes les données
    const donnees = await collection.find({}).toArray();

    console.log("--- Données stockées ---");
<<<<<<< HEAD
    console.table(donnees); // Utilise un tableau pour une lecture propre
  } catch (e) {
    console.error("Erreur de connexion :", e);
  } finally {
    // Fermeture de la connexion
=======
    console.table(donnees);
  } catch (e) {
    console.error("Erreur de connexion :", e);
  } finally {
>>>>>>> dev
    await client.close();
  }
}

main();
