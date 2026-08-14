require("dotenv").config();
const express = require("express");
const multer = require("multer"); 
const connectDB = require("./SRC/config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("./SRC/utils/logger");
const errorHandler = require("./SRC/middlewares/errorMiddleware");

const authRouter = require("./SRC/routes/auth.Route");
const userRouter = require("./SRC/routes/user.Route");
const clientRouter = require("./SRC/routes/client.Route");
const meterRouter = require("./SRC/routes/meter.Route");
const saleRouter = require("./SRC/routes/sale.Route");
const rateRouter = require("./SRC/routes/rate.Route");
const dashboardRouter = require("./SRC/routes/dashboard.Route");

const app = express();

app.use(express.json());
app.use(cookieParser());

// Configuration CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Route test
app.get("/", (req, res) => {
  res.send("l'API CPMS en marche...");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API healthy",
    timestamp: new Date().toISOString(),
  });
});


app.use("/api/v1/auth", authRouter); // Routes d'authentification Admin
app.use("/api/v1/users", userRouter); // Routes pour les utilisateurs
app.use("/api/v1/clients", clientRouter); // Routes pour les clients
app.use("/api/v1/meters", meterRouter); // Routes pour les compteurs
app.use("/api/v1/sales", saleRouter); // Routes pour les ventes
app.use("/api/v1/rates", rateRouter); // Routes pour les tarifs
app.use("/api/v1/dashboard", dashboardRouter); // Routes pour les dashboards

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "L'image est trop lourde (max 2Mo)" });
    }
    return res.status(400).json({ message: `Erreur d'upload: ${err.message}` });
  }

  next(err);
});

app.use(errorHandler);

const PORT = process.env.PORT || 7000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Le serveur tourne sur le port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error("Database connection failed", { error: error.message });
    process.exit(1);
  });
