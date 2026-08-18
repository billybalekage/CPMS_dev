<<<<<<< HEAD
// exports.authorize = (...allowedRoles) => {
//   return (req, res, next) => {
//     //  Sécurité : Vérifier si l'utilisateur existe (injecté par userAuth)
//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: "Utilisateur non authentifié (req.user est manquant)",
//       });
//     }

//     // Vérification du rôle
//     // Utilisation de "allowedRoles" pour correspondre au paramètre
//     if (!allowedRoles.includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: `Le rôle "${req.user.role}" n'est pas autorisé à accéder à cette ressource`,
//       });
//     }

//     // Tout est bon, on passe à la suite
//     next();
//   };
// };


exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log("--- DEBUG AUTHORIZE ---");
    console.log("Utilisateur dans REQ:", req.user.email);
    console.log("Rôle dans REQ:", req.user.role);
    console.log("Rôles autorisés pour cette route:", roles);
=======
exports.authorize = (...roles) => {
  return (req, res, next) => {
>>>>>>> dev
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