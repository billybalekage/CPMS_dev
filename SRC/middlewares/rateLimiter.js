const rateLimit = require("express-rate-limit");

exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
  max: 5, // Limite à 5 tentatives de connexion par IP
  message: {
    message:
      "Trop de tentatives de connexion échouées. Veuillez réessayer plus tard",
  },
  standardHeaders: true, 
  legacyHeaders: false,
});
