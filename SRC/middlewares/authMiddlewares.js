const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");

exports.userAuth = async (req, res, next) => {
  // On cherche le token dans les cookies OU dans le header Authorization
  let token = req.cookies.token;

  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Accès refusé, token manquant" });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(tokenDecode.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};