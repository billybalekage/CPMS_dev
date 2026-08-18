exports.authorize = (...roles) => {
  return (req, res, next) => {
    // 1. Vérifie si req.user existe (injecté par userAuth)
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // 2. Vérifie si le rôle de l'utilisateur est dans la liste autorisée
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle "${req.user.role}" n'est pas autorisé à accéder à cette ressource`,
      });
    }

    next();
  };
};
