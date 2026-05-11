const express = require("express");
const { userAuth } = require("../middlewares/authMiddlewares");
const { authorize } = require("../middlewares/roleMiddleware");
const {
  createMeter,
  getAllMeters,
  getMeterById,
  assignMeterToClient,
  deleteMeter,
} = require("../controllers/meter.controller");

const meterRouter = express.Router();

meterRouter.post("/add", userAuth, authorize("admin", "accountant"), createMeter);
meterRouter.get("/", userAuth, authorize("admin", "accountant", "sales", "technician"), getAllMeters);
meterRouter.get("/:id", userAuth, authorize("admin", "accountant", "sales", "technician"), getMeterById);
meterRouter.post("/:id/assign", userAuth, authorize("admin", "accountant"), assignMeterToClient);
meterRouter.delete("/:id", userAuth, authorize("admin"), deleteMeter);

module.exports = meterRouter;
