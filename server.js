require("dotenv").config();

const http = require("http");
const createApp = require("./SRC/jobs/app");
const connectDB = require("./SRC/config/db");
const { logger } = require("./SRC/jobs/logger");
const { env } = require("./SRC/jobs/config");

const app = createApp();
const server = http.createServer(app);

server.keepAliveTimeout = env.KEEP_ALIVE_TIMEOUT;
server.headersTimeout = env.HEADERS_TIMEOUT;
server.requestTimeout = env.REQUEST_TIMEOUT;

app.get("/", (_req, res) => {
  res.send("API CPMS en marche...");
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API healthy",
    timestamp: new Date().toISOString(),
  });
});

const startServer = async () => {
  try {
    await connectDB();
    const port = env.PORT || 7000;

    server.listen(port, () => {
      logger.info(`Le serveur tourne sur le port ${port}`);
    });
  } catch (error) {
    logger.error("Failed to start server", { error: error.message });
    process.exit(1);
  }
};

startServer();
