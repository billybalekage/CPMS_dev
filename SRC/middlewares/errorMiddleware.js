const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  if (err instanceof Error) {
    logger.error("Unhandled error", {
      path: req.originalUrl,
      method: req.method,
      message: err.message,
      stack: err.stack,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: "Données invalides", error: err.message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: "Conflit de données", error: "Doublon détecté" });
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ success: false, message: "Requête JSON invalide" });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  return res.status(500).json({ success: false, message: "Erreur interne du serveur" });
};

module.exports = errorHandler;
