const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const cloudinary = require("../config/cloudinary");

const UserModel = require("../models/User");
const OtpModel = require("../models/Otp");
const { transporter } = require("../services/nodemailer.service");
const { generateOTP } = require("../services/otpGenerator.service");
const logger = require("../utils/logger");

// createUser
exports.createUser = async (req, res) => {
  try {
    const { fullName, email, phone, address, role, status } = req.body;

    // 1. Validation des champs obligatoires
    if (!fullName || !email || !phone) {
      return res.status(400).json({
        message: "Le nom, l'email et le téléphone sont requis",
      });
    }

    // 2. Vérification du format de l'email et normalisation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Format d'email invalide" });
    }
    const cleanEmail = validator.normalizeEmail(email) || email.toLowerCase();

    // 3. Vérifier si l'utilisateur existe déjà
    const existingUser = await UserModel.findOne({ email: cleanEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Cet email est déjà utilisé par un autre compte" });
    }

    let profileImageUrl = ""; // URL par défaut vide
    // Si l'admin a sélectionné un fichier image
    if (req.file) {
      try {
        // Upload du buffer vers Cloudinary
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "cpms_profiles", // Dossier spécifique
              transformation: [
                { width: 500, height: 500, crop: "fill", gravity: "face" }, // Optimisation portrait
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );
          uploadStream.end(req.file.buffer); // Envoi du fichier
        });

        profileImageUrl = result.secure_url; // Récupération de l'URL finale
      } catch (uploadError) {
        console.error("Erreur Cloudinary lors de createUser:", uploadError);
        // Optionnel : Vous pouvez choisir de bloquer la création ou de continuer sans image
        return res
          .status(500)
          .json({ message: "Erreur lors de l'upload de l'image de profil." });
      }
    }
    const tempPassword = "ChangeMe2026!";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // 6. Création de l'utilisateur
    const newUser = new UserModel({
      fullName,
      email: cleanEmail,
      phone,
      address,
      role,
      status: status || "active",
      password: hashedPassword,
      isAccountVerified: false, // Il devra valider son email via OTP plus tard
    });

    await newUser.save();

    // 7. Envoi d'un email d'invitation
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: cleanEmail,
        subject: "Création de votre compte CPMS",
        text: `Bonjour ${fullName}, votre compte ${role} a été créé par l'administrateur. 
               Votre mot de passe temporaire est : ${tempPassword}. 
               Veuillez vous connecter pour le modifier.`,
      });
    } catch (mailError) {
      console.error("Erreur envoi mail de bienvenue:", mailError);
      // On ne bloque pas la réponse car l'utilisateur est déjà créé en DB
    }

    res.status(201).json({
      success: true,
      message: `Utilisateur avec le rôle ${role} créé avec succès`,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        profileImage: profileImageUrl,
      },
    });
  } catch (error) {
    // Si c'est une erreur de doublon (code 11000)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Ce numéro de téléphone est déjà utilisé.",
      });
    }
    console.error("Erreur dans createUser:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la création de l'utilisateur" });
  }
};

// loginUser
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation rapide
    if (!email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const cleanEmail = validator.normalizeEmail(email) || email.toLowerCase();

    // 2. Recherche de l'utilisateur (on récupère le password masqué)
    const user = await UserModel.findOne({ email: cleanEmail }).select(
      "+password",
    );

    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // 3. VÉRIFICATION DU STATUT (Très important pour les employés !)
    if (user.status === "inactive") {
      return res.status(403).json({
        message:
          "Votre compte a été suspendu. Veuillez contacter l'administrateur.",
      });
    }

    // 4. Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // 5. Gestion du 2FA (Si activé pour ce rôle)
    if (user.isTwoFactorEnabled) {
      const otp = generateOTP(6);

      // Supprimer les OTPs existants non utilisés pour ce type et utilisateur
      await OtpModel.deleteMany({
        userId: user._id,
        type: "two_factor",
        isUsed: false,
      });

      // Créer un nouvel OTP
      await OtpModel.create({
        userId: user._id,
        type: "two_factor",
        code: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      // await user.save(); // Plus besoin de sauvegarder l'utilisateur

      await transporter
        .sendMail({
          from: process.env.SENDER_EMAIL,
          to: user.email,
          subject: "Votre code de connexion CPMS",
          text: `Votre code est : ${otp}`,
        })
        .catch((err) => console.error("Erreur mail 2FA:", err));

      return res.status(200).json({ requires2FA: true, userId: user._id });
    }

    // 6. GÉNÉRATION DU TOKEN & COOKIE
    // On inclut le rôle dans le token pour faciliter les vérifications côté Frontend
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 7. Réponse avec les infos de l'utilisateur
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: `Bienvenue, vous êtes connecté en tant que ${user.role}`,
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Erreur Login:", error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

// getAllUser
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    const query = { role: { $ne: "admin" } };

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * pageSize;

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      UserModel.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      users,
    });
  } catch (error) {
    console.error("Erreur dans getAllUsers:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs",
      error: error.message,
    });
  }
};
// getUserById
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Erreur dans getUserById:", error);
    res.status(500).json({ message: "ID invalide ou erreur serveur" });
  }
};

// UpdateUserById
exports.updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, address, role } = req.body;

    // 1. Vérifier si l'utilisateur existe
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // 2. Mise à jour sélective
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (role) {
      const allowedRoles = ["accountant", "sales", "technician"];
      if (allowedRoles.includes(role)) {
        user.role = role;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Informations mises à jour avec succès",
      user: {
        id: user._id,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Erreur dans updateUserById:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

// deleteUser
exports.deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // 1. Nettoyage Cloudinary
    if (user.profileImage && user.profileImage.includes("cloudinary")) {
      try {
        const publicId = user.profileImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`cpms_profiles/${publicId}`);
      } catch (err) {
        console.error("Erreur suppression image lors de deleteUser:", err);
      }
    }

    // 2. Suppression base de données
    await UserModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Utilisateur supprimé définitivement",
    });
  } catch (error) {
    console.error("Erreur dans deleteUser:", error);
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

// on bascule  entre "active" et "inactive"
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params; // L'ID de l'utilisateur à modifier

    // 1. Rechercher l'utilisateur
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // 2. Sécurité : Empêcher un admin de désactiver son propre compte via cette route
    if (user._id.toString() === req.userId.toString()) {
      return res.status(400).json({
        message:
          "Vous ne pouvez pas désactiver votre propre compte administrateur ici",
      });
    }

    // 3. Basculer le statut
    // Si c'est 'active', ça devient 'inactive'. Sinon, ça devient 'active'.
    const newStatus = user.status === "active" ? "inactive" : "active";
    user.status = newStatus;

    await user.save();

    res.status(200).json({
      success: true,
      message: `Le compte de ${user.fullName} est désormais ${newStatus}`,
      status: user.status,
    });
  } catch (error) {
    console.error("Erreur dans toggleUserStatus:", error);
    res.status(500).json({ message: "Erreur lors du changement de statut" });
  }
};

// Changer le mot de passe
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validation des entrées
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Les deux mots de passe sont requis" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Le nouveau mot de passe doit contenir au moins 6 caractères",
      });
    }

    // 2. Récupération de l'utilisateur (avec le champ password)
    const user = await UserModel.findById(req.userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // 3. Vérification de l'ancien mot de passe
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Ancien mot de passe incorrect" });
    }

    // 4. Hachage et mise à jour
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res
      .status(200)
      .json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error("Erreur changePassword:", error);
    return res.status(500).json({
      message: "Erreur lors du changement de mot de passe",
      error: error.message,
    });
  }
};

// Utilisation de l'OTP pour la 2FA lors de la connexion
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res
        .status(400)
        .json({ message: "Données manquantes (ID ou Code)" });
    }

    const user = await UserModel.findById(userId);

    // Vérification de l'OTP
    const otpDoc = await OtpModel.findOne({
      userId: user._id,
      type: "two_factor",
      code: otp.toString(),
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      return res.status(401).json({ message: "Code incorrect ou expiré" });
    }

    // Marquer l'OTP comme utilisé
    otpDoc.isUsed = true;
    await otpDoc.save();

    // GÉNÉRATION DU TOKEN FINAL
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Stockage du token dans le cookie (Cohérence avec logout/login)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Authentification réussie",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur verifyLoginOtp:", error);
    return res
      .status(500)
      .json({ message: "Erreur lors de la vérification 2FA" });
  }
};

// Deconnection de l'utilisateur ( supprimer le token du cookie)
exports.logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({ message: "Déconnexion réussie" });
};

// Envoie un OTP pour verifier le compte
exports.sendVerifyOtp = async (req, res) => {
  try {
    // On récupère l'ID depuis le middleware d'auth
    const userId = req.userId;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "utilisateur non trouvé" });
    }

    // Verifier si le compte est deja verifie
    if (user.isAccountVerified) {
      return res.status(400).json({ message: "Ce compte est déjà vérifié" });
    }

    // Générer un OTP à 6 chiffres
    const otp = generateOTP(6);

    // Supprimer les OTPs existants non utilisés pour ce type et utilisateur
    await OtpModel.deleteMany({
      userId: user._id,
      type: "email_verification",
      isUsed: false,
    });

    // Créer un nouvel OTP
    await OtpModel.create({
      userId: user._id,
      type: "email_verification",
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Construire le mail avec le OTP
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Code de vérification de votre email",
      text: `Votre code de vérification est : ${otp}. Il expire dans 10 minutes.`,
    };

    // Envoi du mail
    try {
      await transporter.sendMail(mailOptions);
      return res
        .status(200)
        .json({ message: "Code de vérification envoyé à votre email" });
    } catch (error) {
      console.error("Erreur SMTP :", error);
      return res.status(500).json({
        message:
          "Erreur lors de l'envoi de l'email, veuillez réessayer plus tard",
      });
    }
  } catch (error) {
    console.error("Erreur dans sendVerifyOtp:", error);
    res.status(500).json({
      message: "Erreur interne du serveur",
      error: error.message,
    });
  }
};

// Verifier le otp et verifier le compte
exports.verifyEmail = async (req, res) => {
  try {
    // on recupere l'ID depuis le middleware
    const userId = req.userId;
    const { otp } = req.body; // otp stoke dans le body

    // Vérification des entrées
    if (!userId || !otp) {
      return res
        .status(400)
        .json({ message: "ID utilisateur et code (OTP) sont requis" });
    }

    // Récupération de l'utilisateur
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérification de l'OTP
    const otpDoc = await OtpModel.findOne({
      userId: user._id,
      type: "email_verification",
      code: otp.toString(),
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      return res.status(400).json({ message: "Code OTP invalide ou expiré" });
    }

    // 5. Mise à jour de l'utilisateur
    user.isAccountVerified = true;
    await user.save();

    // Marquer l'OTP comme utilisé
    otpDoc.isUsed = true;
    await otpDoc.save();

    return res.status(200).json({ message: "Email vérifié avec succès" });
  } catch (error) {
    console.error("Erreur dans verifyEmail:", error);
    return res.status(500).json({
      message: "Erreur lors de la vérification de l'email",
      error: error.message,
    });
  }
};

// OTP pour réinitialiser le mot de passe
exports.sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "L'email est requis" });
  }

  try {
    // Normalisation pour être sûr de trouver l'utilisateur
    const cleanEmail = validator.normalizeEmail(email) || email.toLowerCase();
    const user = await UserModel.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const otp = generateOTP(6);

    // Supprimer les OTPs existants non utilisés pour ce type et utilisateur
    await OtpModel.deleteMany({
      userId: user._id,
      type: "reset_password",
      isUsed: false,
    });

    // Créer un nouvel OTP
    await OtpModel.create({
      userId: user._id,
      type: "reset_password",
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      text: `Votre code de réinitialisation est : ${otp}. Il expire dans 10 minutes.`,
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: "Code envoyé avec succès" });
    } catch (error) {
      console.error("Erreur SMTP :", error);
      return res
        .status(500)
        .json({ message: "Erreur lors de l'envoi de l'email" });
    }
  } catch (error) {
    console.error("Erreur dans sendResetOtp:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email, code et nouveau mot de passe sont requis" });
  }

  // Vérification de la longueur du nouveau mot de passe
  if (newPassword.length < 6) {
    return res.status(400).json({
      message: "Le mot de passe doit contenir au moins 6 caractères",
    });
  }

  try {
    const cleanEmail = validator.normalizeEmail(email) || email.toLowerCase();
    const user = await UserModel.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérification de l'OTP
    const otpDoc = await OtpModel.findOne({
      userId: user._id,
      type: "reset_password",
      code: otp.toString(),
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      return res
        .status(400)
        .json({ message: "Code de réinitialisation invalide ou expiré" });
    }

    // Hachage du nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mise à jour et nettoyage
    user.password = hashedPassword;
    await user.save();

    // Marquer l'OTP comme utilisé
    otpDoc.isUsed = true;
    await otpDoc.save();

    return res
      .status(200)
      .json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    console.error("Erreur dans resetPassword:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Vérifier si user est authentifié
exports.isAuthenticated = async (req, res) => {
  try {
    // On vérifie si req.userId existe
    if (!req.userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const user = await UserModel.findById(req.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    // On renvoie les infos de l'utilisateur
    return res.status(200).json({
      success: true,
      message: "Utilisateur authentifié",
      user,
    });
  } catch (error) {
    console.error("Erreur dans isAuthenticated:", error);
    return res.status(500).json({
      message: "Erreur lors de la vérification de l'authentification",
      error: error.message,
    });
  }
};

// audit et logs
