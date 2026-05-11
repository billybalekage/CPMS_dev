const SaleModel = require("../models/Sale");
const TokenModel = require("../models/Token");
const RateModel = require("../models/Rate");
const ClientModel = require("../models/clients");
const MeterModel = require("../models/Meter");
const tokenGeneratorService = require("../services/tokenGenerator.service");


// Créer une nouvelle vente
exports.createSale = async (req, res) => {
  try {
    const { clientId, rateId, paymentMethod, amount } = req.body;

    if (!clientId || !rateId || !paymentMethod || !amount) {
      return res.status(400).json({ message: "Tous les champs sont requis (clientId, rateId, paymentMethod, amount)" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Le montant doit être positif" });
    }

    const client = await ClientModel.findById(clientId).populate("meter");
    if (!client) {
      return res.status(404).json({ message: "Client introuvable" });
    }

    if (!client.meter) {
      return res.status(400).json({ message: "Le client n'a pas de compteur assigné" });
    }

    if (client.status === "inactif") {
      return res.status(400).json({ message: "Le client est inactif" });
    }

    const rate = await RateModel.findById(rateId);
    if (!rate) {
      return res.status(404).json({ message: "Tarif introuvable" });
    }

    if (rate.status === "inactive") {
      return res.status(400).json({ message: "Ce tarif n'est pas disponible" });
    }

    if (rate.clientType !== client.clientType) {
      return res.status(400).json({ message: "Le tarif ne correspond pas au type de client" });
    }

    // Calculer le crédit (kWh) en fonction du montant payé et du tarif
    // Formule: crédit = montant / (prix par kWh)
    const pricePerKwh = rate.amount / rate.credit; // Prix par kWh
    const calculatedCredit = amount / pricePerKwh; // Crédit en kWh

    // Arrondir à 2 décimales pour éviter les problèmes de précision
    const finalCredit = Math.round(calculatedCredit * 100) / 100;

    // Créer la vente
    const sale = new SaleModel({
      client: client._id,
      meter: client.meter._id,
      rate: rate._id,
      amount: amount, // Montant payé par le client
      credit: finalCredit, // Crédit calculé en kWh
      status: "pending",
      paymentMethod,
      createdBy: req.userId,
    });

    await sale.save();

    // Générer le TOKEN
    let tokenCode;
    try {
      tokenCode = tokenGeneratorService.generateToken({
        saleId: sale._id.toString(),
        meterId: client.meter._id.toString(),
        meterNumber: client.meterNumber,
        clientType: client.clientType,
        clientId: client._id.toString(),
        amount: finalCredit, // Utiliser le crédit calculé
      });
    } catch (tokenError) {
      console.error("Erreur génération token:", tokenError);
      return res.status(500).json({ message: "Erreur lors de la génération du token", error: tokenError.message });
    }

    // Créer l'objet TOKEN en base
    const token = new TokenModel({
      code: tokenCode,
      sale: sale._id,
      client: client._id,
      meter: client.meter._id,
      meterNumber: client.meterNumber,
      credit: finalCredit, // Utiliser le crédit calculé
      status: "unused",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    try {
      await token.save();
      sale.token = token._id;
      sale.status = "completed";
      await sale.save();
    } catch (tokenSaveError) {
      console.error("Erreur sauvegarde token en base:", tokenSaveError);
      return res.status(500).json({ message: "Erreur lors de l'enregistrement du token", error: tokenSaveError.message });
    }

  
    return res.status(201).json({
      success: true,
      message: "Vente créée avec succès",
      sale,
      token: {
        code: tokenCode,
        credit: finalCredit, // Retourner le crédit calculé
        expiresAt: token.expiresAt,
      },
    });
  } catch (error) {
    console.error("Erreur createSale:", error);
    return res.status(500).json({ message: "Erreur lors de la création de la vente", error: error.message });
  }
};

// Récupérer toutes les ventes
exports.getAllSales = async (req, res) => {
  try {
    const sales = await SaleModel.find()
      .populate("client", "fullName email phone meterNumber")
      .populate("meter", "meterNumber status")
      .populate("rate", "name amount credit")
      .populate("token", "code status")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: sales.length, sales });
  } catch (error) {
    console.error("Erreur getAllSales:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des ventes", error: error.message });
  }
};

// Récupérer une vente par ID
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await SaleModel.findById(id)
      .populate("client", "fullName email phone meterNumber")
      .populate("meter", "meterNumber status")
      .populate("rate", "name amount credit")
      .populate("token", "code status expiresAt");

    if (!sale) {
      return res.status(404).json({ message: "Vente introuvable" });
    }

    return res.status(200).json({ success: true, sale });
  } catch (error) {
    console.error("Erreur getSaleById:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération de la vente", error: error.message });
  }
};

// Récupérer les ventes d'un client
exports.getSalesByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const sales = await SaleModel.find({ client: clientId })
      .populate("rate", "name amount credit")
      .populate("token", "code status expiresAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: sales.length, sales });
  } catch (error) {
    console.error("Erreur getSalesByClient:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des ventes du client", error: error.message });
  }
};

// Annuler une vente
exports.cancelSale = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await SaleModel.findById(id);
    if (!sale) {
      return res.status(404).json({ message: "Vente introuvable" });
    }

    if (sale.status === "cancelled") {
      return res.status(400).json({ message: "Cette vente est déjà annulée" });
    }

    if (sale.token) {
      const token = await TokenModel.findById(sale.token);
      if (token && token.status === "used") {
        return res.status(400).json({ message: "Impossible d'annuler une vente dont le token a été utilisé" });
      }

      if (token) {
        token.status = "cancelled";
        await token.save();
      }
    }

    sale.status = "cancelled";
    await sale.save();

    return res.status(200).json({ success: true, message: "Vente annulée avec succès", sale });
  } catch (error) {
    console.error("Erreur cancelSale:", error);
    return res.status(500).json({ message: "Erreur lors de l'annulation de la vente", error: error.message });
  }
};
