const rateLimit = require("express-rate-limit");

<<<<<<< HEAD
// Configuration pour le login
=======
>>>>>>> dev
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
  max: 5, // Limite à 5 tentatives de connexion par IP
  message: {
    message:
<<<<<<< HEAD
      "Trop de tentatives de connexion échouées. Veuillez réessayer dans 15 minutes pour votre sécurité.",
=======
      "Trop de tentatives de connexion échouées. Veuillez réessayer plus tard",
>>>>>>> dev
  },
  standardHeaders: true, 
  legacyHeaders: false,
});
