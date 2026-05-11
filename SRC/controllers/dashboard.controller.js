const ClientModel = require("../models/clients");
const SaleModel = require("../models/Sale");
const TokenModel = require("../models/Token");
const RateModel = require("../models/Rate");
const MeterModel = require("../models/Meter");
const UserModel = require("../models/User");
const TransactionModel = require("../models/Transaction");

// Dashboard principal - Métriques générales
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Clients
    const totalClients = await ClientModel.countDocuments();
    const activeClients = await ClientModel.countDocuments({ status: "actif" });
    const inactiveClients = await ClientModel.countDocuments({ status: "inactif" });

    // Compteurs
    const totalMeters = await MeterModel.countDocuments();
    const assignedMeters = await MeterModel.countDocuments({ status: "assigned" });
    const unassignedMeters = await MeterModel.countDocuments({ status: "unassigned" });

    // Ventes
    const totalSales = await SaleModel.countDocuments();
    const completedSales = await SaleModel.countDocuments({ status: "completed" });
    const pendingSales = await SaleModel.countDocuments({ status: "pending" });

    // Revenus
    const totalRevenue = await SaleModel.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const monthlyRevenue = await SaleModel.aggregate([
      { $match: { status: "completed", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Crédit distribué
    const totalCreditDistributed = await SaleModel.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$credit" } } }
    ]);

    // Tokens
    const totalTokens = await TokenModel.countDocuments();
    const usedTokens = await TokenModel.countDocuments({ status: "used" });
    const unusedTokens = await TokenModel.countDocuments({ status: "unused" });

    // Utilisateurs système
    const totalUsers = await UserModel.countDocuments();
    const activeUsers = await UserModel.countDocuments({ status: "active" });

    // Tarifs actifs
    const activeRates = await RateModel.countDocuments({ status: "active" });
    const inactiveRates = await RateModel.countDocuments({ status: "inactive" });

    const stats = {
      clients: {
        total: totalClients,
        active: activeClients,
        inactive: inactiveClients,
        activePercentage: totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0,
      },
      meters: {
        total: totalMeters,
        assigned: assignedMeters,
        unassigned: unassignedMeters,
        assignedPercentage: totalMeters > 0 ? Math.round((assignedMeters / totalMeters) * 100) : 0,
      },
      sales: {
        total: totalSales,
        completed: completedSales,
        pending: pendingSales,
        completionRate: totalSales > 0 ? Math.round((completedSales / totalSales) * 100) : 0,
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        monthly: monthlyRevenue[0]?.total || 0,
      },
      credit: {
        totalDistributed: totalCreditDistributed[0]?.total || 0,
      },
      tokens: {
        total: totalTokens,
        used: usedTokens,
        unused: unusedTokens,
        usageRate: totalTokens > 0 ? Math.round((usedTokens / totalTokens) * 100) : 0,
      },
      system: {
        totalUsers,
        activeUsers,
        activeRates,
      },
      Rates: {
        active: activeRates,
        inactive: inactiveRates,
      }
    };

    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Erreur getDashboardStats:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des statistiques", error: error.message });
  }
};

// Revenus par période
exports.getRevenueByPeriod = async (req, res) => {
  try {
    const { period = "month", year = new Date().getFullYear() } = req.query;

    let groupBy;
    let match = { status: "completed" };

    switch (period) {
      case "month":
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
        break;
      case "day":
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
        break;
      default:
        return res.status(400).json({ message: "Période invalide (month ou day)" });
    }

    const revenueData = await SaleModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: "$amount" },
          totalCredit: { $sum: "$credit" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
      { $limit: 12 }, // Derniers 12 mois/jours
    ]);

    return res.status(200).json({ success: true, period, data: revenueData });
  } catch (error) {
    console.error("Erreur getRevenueByPeriod:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des revenus", error: error.message });
  }
};

// Statistiques par type de client
exports.getStatsByClientType = async (req, res) => {
  try {
    const clientTypeStats = await ClientModel.aggregate([
      {
        $group: {
          _id: "$clientType",
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ["$status", "actif"] }, 1, 0] }
          },
        },
      },
      {
        $project: {
          clientType: "$_id",
          total: "$count",
          active: "$activeCount",
          inactive: { $subtract: ["$count", "$activeCount"] },
          activePercentage: {
            $round: [
              { $multiply: [{ $divide: ["$activeCount", "$count"] }, 100] },
              1,
            ],
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const salesByClientType = await SaleModel.aggregate([
      {
        $lookup: {
          from: "clients",
          localField: "client",
          foreignField: "_id",
          as: "clientInfo",
        },
      },
      { $unwind: "$clientInfo" },
      {
        $group: {
          _id: "$clientInfo.clientType",
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
          totalCredit: { $sum: "$credit" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      clientTypeStats,
      salesByClientType,
    });
  } catch (error) {
    console.error("Erreur getStatsByClientType:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des statistiques par type", error: error.message });
  }
};

// Top clients par consommation/revenus
exports.getTopClients = async (req, res) => {
  try {
    const { limit = 10, sortBy = "revenue" } = req.query;

    let sortField;
    switch (sortBy) {
      case "revenue":
        sortField = "totalRevenue";
        break;
      case "sales":
        sortField = "totalSales";
        break;
      case "credit":
        sortField = "totalCredit";
        break;
      default:
        sortField = "totalRevenue";
    }

    const topClients = await SaleModel.aggregate([
      {
        $lookup: {
          from: "clients",
          localField: "client",
          foreignField: "_id",
          as: "clientInfo",
        },
      },
      { $unwind: "$clientInfo" },
      {
        $group: {
          _id: "$client",
          clientName: { $first: "$clientInfo.fullName" },
          clientEmail: { $first: "$clientInfo.email" },
          clientType: { $first: "$clientInfo.clientType" },
          meterNumber: { $first: "$clientInfo.meterNumber" },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
          totalCredit: { $sum: "$credit" },
          lastPurchase: { $max: "$createdAt" },
        },
      },
      { $sort: { [sortField]: -1 } },
      { $limit: parseInt(limit) },
    ]);

    return res.status(200).json({ success: true, sortBy, limit, topClients });
  } catch (error) {
    console.error("Erreur getTopClients:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des top clients", error: error.message });
  }
};

// Alertes et notifications système
exports.getSystemAlerts = async (req, res) => {
  try {
    // Tokens expirant bientôt (dans 7 jours)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const expiringTokens = await TokenModel.countDocuments({
      status: "unused",
      expiresAt: { $lte: sevenDaysFromNow },
    });

    // Ventes en attente
    const pendingSales = await SaleModel.countDocuments({ status: "pending" });

    // Clients sans achat récent (30 jours)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const inactiveClients = await ClientModel.countDocuments({
      status: "actif",
      updatedAt: { $lt: thirtyDaysAgo },
    });

    // Compteurs non assignés
    const unassignedMeters = await MeterModel.countDocuments({ status: "unassigned" });

    const alerts = {
      expiringTokens,
      pendingSales,
      inactiveClients,
      unassignedMeters,
      totalAlerts: expiringTokens + pendingSales + inactiveClients + unassignedMeters,
    };

    return res.status(200).json({ success: true, alerts });
  } catch (error) {
    console.error("Erreur getSystemAlerts:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des alertes", error: error.message });
  }
};
