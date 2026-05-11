const express = require("express");
const { userAuth } = require("../middlewares/authMiddlewares");
const { authorize } = require("../middlewares/roleMiddleware");
const dashboardController = require("../controllers/dashboard.controller");

const dashboardRouter = express.Router();

// Toutes les routes dashboard nécessitent une authentification
dashboardRouter.use(userAuth);

// Routes pour les statistiques générales
dashboardRouter.get("/stats", authorize("admin", "accountant"), dashboardController.getDashboardStats);

// Routes pour les revenus par période
dashboardRouter.get("/revenue", authorize("admin", "accountant"), dashboardController.getRevenueByPeriod);

// Routes pour les statistiques par type de client
dashboardRouter.get("/client-types", authorize("admin", "accountant"), dashboardController.getStatsByClientType);

// Routes pour les top clients
dashboardRouter.get("/top-clients", authorize("admin", "accountant"), dashboardController.getTopClients);

// Routes pour les alertes système
dashboardRouter.get("/alerts", authorize("admin", "accountant"), dashboardController.getSystemAlerts);

module.exports = dashboardRouter;