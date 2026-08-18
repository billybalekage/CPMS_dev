const RateModel = require("../models/Rate");

// Créer un nouveau tarif
exports.createRate = async (req, res) => {
  try {
    const { name, description, amount, credit, clientType } = req.body;

    if (!name || !amount || !credit || !clientType) {
      return res
        .status(400)
        .json({ message: "Les champs obligatoires sont requis" });
    }

    const numericAmount = Number(amount);
    const numericCredit = Number(credit);
    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !Number.isFinite(numericCredit) ||
      numericCredit <= 0
    ) {
      return res.status(400).json({
        message: "Le montant et le crédit doivent être des nombres positifs",
      });
    }

    if (!["prive", "entreprise", "usine"].includes(clientType)) {
      return res.status(400).json({ message: "Type de client invalide" });
    }

    const rate = new RateModel({
      name,
      description,
      amount,
      credit,
      clientType,
      status: "active",
    });

    await rate.save();

    return res.status(201).json({ success: true, rate });
  } catch (error) {
    console.error("Erreur createRate:", error);
    return res.status(500).json({
      message: "Erreur lors de la création du tarif",
      error: error.message,
    });
  }
};

// Récupérer tous les tarifs
exports.getAllRates = async (req, res) => {
  try {
    const { clientType, status } = req.query;
    const filter = {};

    if (clientType) filter.clientType = clientType;
    if (status) filter.status = status;

    const rates = await RateModel.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: rates.length, rates });
  } catch (error) {
    console.error("Erreur getAllRates:", error);
    return res.status(500).json({
      message: "Erreur lors de la récupération des tarifs",
      error: error.message,
    });
  }
};

// Récupérer un tarif par ID
exports.getRateById = async (req, res) => {
  try {
    const { id } = req.params;

    const rate = await RateModel.findById(id);
    if (!rate) {
      return res.status(404).json({ message: "Tarif introuvable" });
    }

    return res.status(200).json({ success: true, rate });
  } catch (error) {
    console.error("Erreur getRateById:", error);
    return res.status(500).json({
      message: "Erreur lors de la récupération du tarif",
      error: error.message,
    });
  }
};

// Mettre à jour un tarif
exports.updateRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, amount, credit, clientType, status } = req.body;

    const rate = await RateModel.findById(id);
    if (!rate) {
      return res.status(404).json({ message: "Tarif introuvable" });
    }

    if (name) rate.name = name;
    if (description) rate.description = description;
    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res
          .status(400)
          .json({ message: "Le montant doit être un nombre positif" });
      }
      rate.amount = numericAmount;
    }
    if (credit !== undefined) {
      const numericCredit = Number(credit);
      if (!Number.isFinite(numericCredit) || numericCredit <= 0) {
        return res
          .status(400)
          .json({ message: "Le crédit doit être un nombre positif" });
      }
      rate.credit = numericCredit;
    }
    if (clientType) {
      if (!["prive", "entreprise", "usine"].includes(clientType)) {
        return res.status(400).json({ message: "Type de client invalide" });
      }
      rate.clientType = clientType;
    }
    if (status) rate.status = status;

    await rate.save();

    return res
      .status(200)
      .json({ success: true, message: "Tarif mis à jour", rate });
  } catch (error) {
    console.error("Erreur updateRate:", error);
    return res.status(500).json({
      message: "Erreur lors de la mise à jour du tarif",
      error: error.message,
    });
  }
};

// Supprimer un tarif
exports.deleteRate = async (req, res) => {
  try {
    const { id } = req.params;

    const rate = await RateModel.findById(id);
    if (!rate) {
      return res.status(404).json({ message: "Tarif introuvable" });
    }

    await RateModel.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Tarif supprimé" });
  } catch (error) {
    console.error("Erreur deleteRate:", error);
    return res
      .status(500)
      .json({
        message: "Erreur lors de la suppression du tarif",
        error: error.message,
      });
  }
};

// Récupérer les tarifs actifs pour un type de client
exports.getActiveRatesByClientType = async (req, res) => {
  try {
    const { clientType } = req.params;

    if (!["prive", "entreprise", "usine"].includes(clientType)) {
      return res.status(400).json({ message: "Type de client invalide" });
    }

    const rates = await RateModel.find({ clientType, status: "active" }).sort({
      amount: 1,
    });

    return res.status(200).json({ success: true, count: rates.length, rates });
  } catch (error) {
    console.error("Erreur getActiveRatesByClientType:", error);
    return res.status(500).json({
      message: "Erreur lors de la récupération des tarifs",
      error: error.message,
    });
  }
};
