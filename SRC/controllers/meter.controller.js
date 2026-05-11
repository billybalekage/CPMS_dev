const MeterModel = require("../models/Meter");
const clientModel = require("../models/clients");

const getClientTypeFromMeter = (meterNumber) => {
  const prefix = meterNumber.substring(0, 2);
  switch (prefix) {
    case "12":
      return "prive";
    case "24":
      return "entreprise";
    case "30":
      return "usine";
    default:
      return "unknown";
  }
};

// Creer un compteur
exports.createMeter = async (req, res) => {
  try {
    
    // ajouer un numero de compteur
    const { meterNumber, location, model } = req.body;

    if (!meterNumber) {
      return res.status(400).json({ message: "Le numéro du compteur est requis" });
    }

    // Verifier si le compteur existe deja (verification par le numero de compteur(meterNumber))
    const existingMeter = await MeterModel.findOne({ meterNumber });
    if (existingMeter) {
      return res.status(400).json({ message: "Ce numéro de compteur existe déjà" });
    }

    const meter = new MeterModel({ meterNumber, location, model });
    await meter.save();

    return res.status(201).json({ success: true, meter });
  } catch (error) {
    console.error("Erreur createMeter:", error);
    return res.status(500).json({ message: "Erreur lors de la création du compteur", error: error.message });
  }
};

// Recuperer tout les compteurs 
exports.getAllMeters = async (req, res) => {
  try {

    // On montre les infos du compteur (client, fullName, email, phone, et le meterNumber)
    const meters = await MeterModel.find().populate("client", "fullName email phone meterNumber");
    return res.status(200).json({ success: true, count: meters.length, meters });// les plus recent d'abord
  } catch (error) {
    console.error("Erreur getAllMeters:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des compteurs", error: error.message });
  }
};


// Recuperer un compteur
exports.getMeterById = async (req, res) => {
  try {
    const { id } = req.params;
    // recuperer le compteur avec les details
    const meter = await MeterModel.findById(id).populate("client", "fullName email phone meterNumber");

    // Si le compteur n'est pas trouve
    if (!meter) {
      return res.status(404).json({ message: "Compteur introuvable" });
    }

    return res.status(200).json({ success: true, meter });
  } catch (error) {
    console.error("Erreur getMeterById:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération du compteur", error: error.message });
  }
};


// Affecter un compteur au client
exports.assignMeterToClient = async (req, res) => {
  try {
    const { meterId } = req.params; // id du compteur
    const { clientId } = req.body; // id du client

    // Id manquant
    if (!clientId) {
      return res.status(400).json({ message: "L'ID du client est requis" });
    }

    // meter manquant
    const meter = await MeterModel.findById(meterId);
    if (!meter) {
      return res.status(404).json({ message: "Compteur introuvable" });
    }

    // Si le compteur est deja attribuer a un autre client
    if (meter.client) {
      return res.status(400).json({ message: "Ce compteur est déjà attribué à un client" });
    }

    // Client manquant
    const client = await clientModel.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client introuvable" });
    }

    // Recuperer le type du client avec le meterNumber
    const clientType = getClientTypeFromMeter(meter.meterNumber);
    if (clientType === "unknown") {
      return res.status(400).json({ message: "Type de client invalide pour ce numéro de compteur" });
    }

    meter.client = client._id; // mis a jour de l'id du client dans la table meter
    meter.status = "assigned"; // mis a jour du status
    await meter.save();

    client.meter = meter._id; // mis a jour de l'id du compteur
    client.meterNumber = meter.meterNumber; // mis a jour du meterNumber
    client.clientType = clientType; // mis a jour du type de client

    try {
      await client.save();
    } catch (clientError) {
      meter.client = null;
      meter.status = "unassigned";
      await meter.save();
      return res.status(500).json({
        message: "Erreur lors de l'attribution du compteur, l'opération a été annulée",
        error: clientError.message,
      });
    }

    return res.status(200).json({ success: true, meter, client });
  } catch (error) {
    console.error("Erreur assignMeterToClient:", error);
    return res.status(500).json({ message: "Erreur lors de l'attribution du compteur", error: error.message });
  }
};


// Suprimer un compteur ( S'il n'est pas assigne a un client)
exports.deleteMeter = async (req, res) => {
  try {
    const { id } = req.params;
    const meter = await MeterModel.findById(id);

    if (!meter) {
      return res.status(404).json({ message: "Compteur introuvable" });
    }

    // Dans le cas ou le compteur est affecter a un client
    if (meter.client) {
      return res.status(400).json({ message: "Impossible de supprimer un compteur déjà attribué" });
    }

    await MeterModel.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Compteur supprimé" });
  } catch (error) {
    console.error("Erreur deleteMeter:", error);
    return res.status(500).json({ message: "Erreur lors de la suppression du compteur", error: error.message });
  }
};
