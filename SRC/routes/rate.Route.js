const express = require("express");
const { userAuth } = require("../middlewares/authMiddlewares");
const { authorize } = require("../middlewares/roleMiddleware");
const {
  createRate,
  getAllRates,
  getRateById,
  updateRate,
  deleteRate,
  getActiveRatesByClientType,
} = require("../controllers/rate.controller");

const rateRouter = express.Router();

// 1. Les routes POST 
rateRouter.post(
  "/create",
  userAuth,
  authorize("admin", "accountant"),
  createRate,
);


rateRouter.get(
  "/",
  userAuth,
  authorize("admin", "accountant",  "technician"),
  getAllRates,
);

rateRouter.get(
  "/active/:clientType",
  userAuth,
  authorize("admin", "accountant",),
  getActiveRatesByClientType,
);

rateRouter.get(
  "/:id",
  userAuth,
  authorize("admin", "accountant", "technician"),
  getRateById,
);

// 4. Les modifications et suppressions
rateRouter.put("/:id", userAuth, authorize("admin", "accountant"), updateRate);
rateRouter.delete("/:id", userAuth, authorize("admin"), deleteRate);

module.exports = rateRouter;