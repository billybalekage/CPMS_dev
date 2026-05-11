const clientModel = require("../models/clients")
const MeterModel = require("../models/Meter");


// Si le type de client est donnee par le numero de compteur
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

// Enregister un nouveau client
exports.createClient = async (req, res) => {
  try {
    const { fullName, email, phone, address, meterId } = req.body;

    if (!fullName || !email || !phone || !address || !meterId) {
      return res
        .status(400)
        .json({ message: "Veuillez renseigner tous les champs" });
    }

    // On recupere l'id du compteur (recherche des compteurs non attribuer a un client )
    const meter = await MeterModel.findById(meterId);
    if (!meter) {
      return res.status(404).json({ message: "Compteur introuvable" });
    }

    // dans le cas ou le compteur est deja utilise par un autre client
    if (meter.client) { 
      return res
        .status(400)
        .json({ message: "Ce compteur est déjà attribué à un client" });
    }

    // Verifier si le client existe (verification par l'id du compteur) si le compteur est attribue a un client
    const existingClient = await clientModel.findOne({ meterId: meter._id });
    if (existingClient) {
      return res
        .status(400)
        .json({ message: "Un client est déjà lié à ce compteur" });
    }

    // recuperer le type de client par le meterNumber
    const clientType = getClientTypeFromMeter(meter.meterNumber);
    if (clientType === "unknown") {
      return res
        .status(400)
        .json({ message: "Type de client invalide, compteur non reconnu" });
    }

    const newClient = new clientModel({
      fullName,
      phone,
      email,
      meterId: meter._id,
      meterNumber: meter.meterNumber,
      address,
      clientType,
    });

    await newClient.save();

    meter.client = newClient._id; // stocker l'id du client qui va utiliser le compteur.
    meter.status = "assigned"; // Mis a jour de la table meter

    try {
      await meter.save(); // Enregister les modif
    } catch (meterError) {
      // si erreur dans l'attribution, on annule la creation du client
      await clientModel.findByIdAndDelete(newClient._id);
      return res.status(500).json({
        success: false,
        message:
          "Erreur lors de l'attribution du compteur, le client a été annulé",
        error: meterError.message,
      });
    }

    // Envoyer un SMS de confirmation au client
    

    return res.status(201).json({
      success: true,
      message: "client enregistré",
      newClient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur dans createClients",
      error: error.message,
    });
    console.error({
      message: "erreur lors de la creation du client",
      error: error.message,
    });
  }
};

// Récupérer le type de client à partir du numéro de compteur
exports.getClientType = async (req, res) => {
  try {
    // Recuperer le numero de compteur
    const { meterNumber } = req.query;

    // meterNumber manquant
    if (!meterNumber) {
      return res
        .status(400)
        .json({ message: "Le numéro de compteur est requis" });
    }

    // Recuperer le type de client avec meterNumber
    const clientType = getClientTypeFromMeter(meterNumber);

    // Si le type est UNKNOWN, Type de client invalide
    if (clientType === "unknown") {
      return res.status(400).json({ message: "Type de client invalide" });
    }

    res.status(200).json({ success: true, clientType });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du type",
      error: error.message,
    });
    console.error({
      message: "Erreur de lors de la recuperation du type de client",
      error: error.message,
    });
  }
};

// Récupérer tous les clients
exports.getAllClient = async (req, res) => {
  try {

    // On recupere le client avec le numero de compteur, le status, localisation du compteur
    const clients = await clientModel.find().populate("meter", "meterNumber status location model");

    // S'il y a pas des client
    if (!clients || clients.length === 0) {
      return res.status(404).json({ message: "Aucun client trouvé" });
    }

    res.status(200).json({ success: true, count: clients.length, clients });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des clients",
      error: error.message,
    });
    console.error({
      message: "erreur dans getAllClient",
      error: error.message,
    });
  }
};


// Récupérer un client par son ID
exports.getClientById = async (req, res) => {
  try {
    // Prendre l'id
    const { id } = req.params;

    // ID manquant
    if (!id) {
      return res.status(400).json({ message: "L'ID du client est requis" });
    }

    // Recuperer le client
    const client = await clientModel.findById(id).populate("meter", "meterNumber status location model");

    // verification de l'existance du client
    if (!client) {
      return res.status(404).json({ message: "Client non trouvé" });
    }

    res.status(200).json({ success: true, client });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du client",
      error: error.message,
    });
  }
};

// Mettre à jour un client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, address, meterId } = req.body;

    if (!id) {
      return res.status(400).json({ message: "L'ID du client est requis" });
    }

    const client = await clientModel.findById(id);
    if (!client) {
      return res.status(404).json({ message: "Client non trouvé" });
    }

    if (client.status === "inactif") {
      return res.status(400).json({message: "Impossible de modifier le compteur d'un client inactif",});
    }

    let oldMeter = null;
    if (meterId && meterId.toString() !== client.meter?.toString()) {
      const newMeter = await MeterModel.findById(meterId);
      if (!newMeter) {
        return res.status(404).json({ message: "Compteur introuvable" });
      }

      if (newMeter.client) {
        return res
          .status(400)
          .json({ message: "Ce compteur est déjà attribué à un client" });
      }

      const clientType = getClientTypeFromMeter(newMeter.meterNumber);
      if (clientType === "unknown") {
        return res
          .status(400)
          .json({ message: "Type de client invalide, compteur non reconnu" });
      }

      oldMeter = await MeterModel.findById(client.meter);
      if (oldMeter) {
        oldMeter.client = null;
        oldMeter.status = "unassigned";
      }

      newMeter.client = client._id;
      newMeter.status = "assigned";
      await newMeter.save();

      client.meter = newMeter._id;
      client.meterNumber = newMeter.meterNumber;
      client.clientType = clientType;
      if (oldMeter) await oldMeter.save();
    }

    if (fullName) client.fullName = fullName;
    if (email) client.email = email;
    if (phone) client.phone = phone;
    if (address) client.address = address;

    await client.save();

    res.status(200).json({
      success: true,
      message: "Client mis à jour avec succès",
      client,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du client",
      error: error.message,
    });
  }
};

// Changer le compteur lié à un client
exports.changeClientMeter = async (req, res) => {
  try {
    const { id } = req.params;
    const { meterId } = req.body; // Id du compteur

    if (!id || !meterId) {
      return res
        .status(400)
        .json({ message: "L'ID du client et le meterId sont requis" });
    }

    const client = await clientModel.findById(id);
    if (!client) {
      return res.status(404).json({ message: "Client non trouvé" });
    }

    if (client.status === "inactif") {
      return res
        .status(400)
        .json({
          message: "Impossible de changer le compteur d'un client inactif",
        });
    }

    // verifier si le compteur extste
    const newMeter = await MeterModel.findById(meterId);
    if (!newMeter) {
      return res.status(404).json({ message: "Compteur introuvable" });
    }

    // Verrifier si le compteur a deja ete atribuer a un autre client
    if (newMeter.client) {
      return res
        .status(400)
        .json({ message: "Ce compteur est déjà attribué à un client" });
    }

    // verifer le type de client
    const clientType = getClientTypeFromMeter(newMeter.meterNumber);
    if (clientType === "unknown") {
      return res
        .status(400)
        .json({ message: "Type de client invalide, compteur non reconnu" });
    }

    const oldMeter = await MeterModel.findById(client.meter);
    if (oldMeter) {
      oldMeter.client = null;
      oldMeter.status = "unassigned";
      await oldMeter.save();
    }

    newMeter.client = client._id;
    newMeter.status = "assigned";
    await newMeter.save();

    client.meter = newMeter._id;
    client.meterNumber = newMeter.meterNumber;
    client.clientType = clientType;
    await client.save();

    res.status(200).json({
      success: true,
      message: "Compteur du client modifié avec succès",
      client,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors du changement de compteur",
      error: error.message,
    });
  }
};

// Supprimer un client
exports.deleteClient = async (req, res) => {
  try {
    // Recuperer l'id du client a enregistrer
    const { id } = req.params;

    // ID manquant
    if (!id) {
      return res.status(400).json({ message: "L'ID du client est requis" });
    }

    // Recuperer le client
    const client = await clientModel.findById(id);

    // Si le client n'existe pas
    if (!client) {
      return res.status(404).json({ message: "Client non trouvé" });
    }

    // Retirer le compteur affecter au client a supprimer et changer sont status == unassigned
    if (client.meter) {
      const meter = await MeterModel.findById(client.meter);
      if (meter) {
        meter.client = null;
        meter.status = "unassigned";
        await meter.save();
      }
    }

    await clientModel.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Client supprimé avec succès" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Erreur lors de la suppression du client",
        error: error.message,
      });
  }
};

// Basculer le statut du client (actif/inactif)
exports.ToggleClientStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // ID manquant
        if (!id) {
            return res.status(400).json({ message: "L'ID du client est requis" })
        }
        
        // Recuperer le client 
        const client = await clientModel.findById(id)
        
        // Verifier que le client existe
        if (!client) {
            return res.status(404).json({ message: "Client non trouvé" })
        }
        
        // status: si c'est actif, on passe a inactif, si c'est inactif on passe a actif
        const newStatus = client.status === "actif" ? "inactif" : "actif"
        client.status = newStatus // aplication du nouveau status
        await client.save()
        
        res.status(200).json({ success: true, message: `Statut du client changé à ${newStatus}`, client })
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur lors du changement de statut", error: error.message })
    }
}


// A Ajouter: supprimer un client si sont status du client est "inactif" pendant 1 annees
