const express = require('express');
const {
  createClient,
  getClientType,
  getAllClient,
  getClientById,
  updateClient,
  changeClientMeter,
  deleteClient,
  ToggleClientStatus,
} = require("../controllers/client.controller");
const { userAuth } = require("../middlewares/authMiddlewares");
const { authorize } = require("../middlewares/roleMiddleware");

const clientRouter = express.Router();

clientRouter.post(
  "/addClient",
  userAuth,
  authorize("admin", "accountant"),
  createClient,
);
clientRouter.get(
  "/type",
  userAuth,
  authorize("admin", "accountant"),
  getClientType,
);
clientRouter.get("/", userAuth, authorize("admin", "accountant"), getAllClient);
clientRouter.get(
  "/:id",
  userAuth,
  authorize("admin", "accountant"),
  getClientById,
);
clientRouter.put(
  "/:id",
  userAuth,
  authorize("admin", "accountant"),
  updateClient,
);
clientRouter.post(
  "/:id/change-meter",
  userAuth,
  authorize("admin", "accountant"),
  changeClientMeter,
);
clientRouter.delete(
  "/:id",
  userAuth,
  authorize("admin", "accountant"),
  deleteClient,
);
clientRouter.patch(
  "/:id/toggle-status",
  userAuth,
  authorize("admin", "accountant"),
  ToggleClientStatus,
);

module.exports = clientRouter;