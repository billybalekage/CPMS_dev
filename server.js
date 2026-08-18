require("dotenv").config();
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
