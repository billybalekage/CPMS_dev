require("dotenv").config();
const express = require("express");
const multer = require("multer"); 
const connectDB = require("./SRC/config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRouter = require("./SRC/routes/auth.Route");
const  userRouter  = require("./SRC/routes/user.Route");
const clientRouter = require("./SRC/routes/client.Route");
const meterRouter = require("./SRC/routes/meter.Route");
const saleRouter = require("./SRC/routes/sale.Route");
const rateRouter = require("./SRC/routes/rate.Route");
const dashboardRouter = require("./SRC/routes/dashboard.Route");

const app = express();

// Connexion DB
connectDB();

// Middleware de base
app.use(express.json());
app.use(cookieParser());

// Configuration CORS 
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // URL frontend (Vite)
    credentials: true,
  }),
);

// Test route
app.get("/", (req, res) => {
  res.send("API CPMS en marche...");
});

// --- DÉCLARATION DES ROUTES ---
app.use("/api/v1/auth", authRouter); // Routes d'authentification Admin
app.use("/api/v1/users", userRouter); // Routes pour les utilisateurs
app.use("/api/v1/clients", clientRouter); // Routes pour les clients
app.use("/api/v1/meters", meterRouter); // Routes pour les compteurs
app.use("/api/v1/sales", saleRouter); // Routes pour les ventes
app.use("/api/v1/rates", rateRouter); // Routes pour les tarifs
app.use("/api/v1/dashboard", dashboardRouter); // Routes pour les dashboards


// --- MIDDLEWARE D'ERREUR (À placer APRÈS les routes) ---
app.use((err, req, res, next) => {
  // Erreurs spécifiques à Multer (poids du fichier, etc.)
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "L'image est trop lourde (max 2Mo)" });
    }
    return res.status(400).json({ message: `Erreur d'upload: ${err.message}` });
  }

  // Autres erreurs (JSON mal formé, etc.)
  if (err) {
    console.error("Erreur serveur:", err.stack);
    return res.status(err.status || 500).json({
      message: err.message || "Une erreur interne est survenue",
    });
  }
  next();
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
const http = require("http");
const createApp = require("./SRC/jobs/app");
const { logger } = require("./SRC/jobs/logger");
const { env } = require("./SRC/jobs/config");
const connectDB = require("./SRC/config/db");

const app = createApp();
const server = http.createServer(app);

server.keepAliveTimeout = env.KEEP_ALIVE_TIMEOUT;
server.headersTimeout = env.HEADERS_TIMEOUT;
server.requestTimeout = env.REQUEST_TIMEOUT;

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

const PORT = env.PORT || 7000;

const startServer = () => {
  server.listen(PORT, () => {
    logger.info(`Le serveur tourne sur le port ${PORT}`);
  });
};

startServer();

connectDB().catch((error) => {
  logger.error("Database connection failed", { error: error.message });
});
