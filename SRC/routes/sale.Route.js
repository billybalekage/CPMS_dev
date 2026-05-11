const express = require("express");
const { userAuth } = require("../middlewares/authMiddlewares");
const { authorize } = require("../middlewares/roleMiddleware");
const {
  createSale,
  getAllSales,
  getSaleById,
  getSalesByClient,
  cancelSale,
} = require("../controllers/sale.controller");

const saleRouter = express.Router();

saleRouter.post("/create", userAuth, authorize("admin", "accountant", "sales"), createSale);
saleRouter.get("/", userAuth, authorize("admin", "accountant", "sales"), getAllSales);
saleRouter.get("/:id", userAuth, authorize("admin", "accountant", "sales"), getSaleById);
saleRouter.get("/client/:clientId", userAuth, authorize("admin", "accountant", "sales"), getSalesByClient);
saleRouter.post("/:id/cancel", userAuth, authorize("admin", "accountant"), cancelSale);

module.exports = saleRouter;
