const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const cloudinary = require("../config/cloudinary");

const UserModel = require("../models/User");
const OtpModel = require("../models/Otp");
const { uploadImage } = require("../services/uploads.service");
const { transporter } = require("../services/nodemailer.service");
const { generateOTP } = require("../services/otpGenerator.service");

// Register admin
exports.registerUser = async (req, res) => {
  try {
<<<<<<< HEAD

=======
>>>>>>> dev
    // recuperer les element dans la requette body (ici le model user)
    const { fullName, email, phone, address, password, status } = req.body;

    // Verifier que les champ ne sont pas vide
    if (!fullName || !email || !phone || !address || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // verifier le format de l'email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Format d'email invalide" });
    }

    //  normalisation de l'email
    const cleanEmail = validator.normalizeEmail(email) || email.toLowerCase();

    // verifier longeurs de mot de pass
    if (password.length < 6) {
<<<<<<< HEAD
      return res
        .status(400)
        .json({
          message: "Le mot de passe doit contenir au moins 6 caractères",
        });
=======
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 6 caractères",
      });
>>>>>>> dev
    }

    // Verifier si l'email existe deja dans la base de donnees
    const existingUser = await UserModel.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Uploader la photo de profile
    let profileImageUrl = "";
    let profileImagePublicId = "";

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "cpms_profiles" },
          (error, result) => (error ? reject(error) : resolve(result)),
        );
        uploadStream.end(req.file.buffer);
      });
      profileImageUrl = result.secure_url;
      profileImagePublicId = result.public_id;
    }

<<<<<<< HEAD

=======
>>>>>>> dev
    // Hasher mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Cree un nouveau user
    const user = new UserModel({
      fullName,
      email: cleanEmail,
      phone,
      address,
      password: hashedPassword,
      profileImage: req.file
        ? {
            public_id: profileImagePublicId,
            url: profileImageUrl,
          }
        : {},
      status,
<<<<<<< HEAD
      role: "admin",
      isAccountVerified: false, 
=======
      role: "admin", // Forcere le role sur cette route
      isAccountVerified: false,
>>>>>>> dev
    });

    await user.save(); // Enregister le nouveau user

    // Generer le token
<<<<<<< HEAD
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
=======
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
>>>>>>> dev

    // Enregistrer le token dans les cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

<<<<<<< HEAD

=======
>>>>>>> dev
    // email de bienvenus
    transporter
      .sendMail({
        from: process.env.SENDER_EMAIL,
        to: cleanEmail,
        subject: "Bienvenue sur CPMS",
        text: `Bienvenue ${fullName} ! Ravi de vous voir sur CPMS.`,
      })
      .catch((err) => console.error("Email Error:", err));

<<<<<<< HEAD
    
    // SMS de bienvenue


    const { password: _, ...userWithoutPassword } = user.toObject();

    //returner une reponse 
    res.status(201).json({
      message: "Utilisateur enregistré avec succès",
      user: userWithoutPassword,
=======
    const { password: _, ...userWithoutPassword } = user.toObject(); // supprimer le mot de passe dans la response

    res.status(201).json({
      message: "Utilisateur enregistré avec succès",
      user: userWithoutPassword, // pas de mot de pass dans la response
>>>>>>> dev
      token,
    });
  } catch (error) {
    console.error("Erreur dans registerUser:", error);
    res
      .status(500)
      .json({ message: "Erreur interne du serveur", error: error.message });
  }
};

// Connection admin
exports.loginUser = async (req, res) => {
  try {
<<<<<<< HEAD


=======
>>>>>>> dev
    const { email, password } = req.body;

    //  Validation des champs
    if (!email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // validation du format de l'email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Email invalide" });
    }

    // netoyer l'email
    const cleanEmail = validator.normalizeEmail(email) || email.toLowerCase();

<<<<<<< HEAD
    // On sélectionne le mot de passe 
=======
    // On sélectionne le mot de passe
>>>>>>> dev
    const user = await UserModel.findOne({ email: cleanEmail }).select(
      "+password",
    );

<<<<<<< HEAD
    // vérification de l'existence et du rôle
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        message: "Accès refusé",
      });
=======
    if (!user) {
      return res
        .status(401)
        .json({ message: "email ou mot de passe manquant" });
>>>>>>> dev
    }

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // 4. Gestion du 2FA
    // ce code s'execute s'il est active
    if (user.isTwoFactorEnabled) {
      const otp = generateOTP(6); // Generer un code de connexion a 6 chiffres

      // Supprimer les OTPs existants non utilisés pour ce type et utilisateur
<<<<<<< HEAD
      await OtpModel.deleteMany({ userId: user._id, type: "two_factor", isUsed: false });
=======
      await OtpModel.deleteMany({
        userId: user._id,
        type: "two_factor",
        isUsed: false,
      });
>>>>>>> dev

      // Créer un nouvel OTP
      await OtpModel.create({
        userId: user._id,
        type: "two_factor",
        code: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      // envoyer l'otp par mail
      try {
        await transporter.sendMail({
          from: process.env.SENDER_EMAIL,
          to: user.email,
          subject: "Code 2FA",
          text: `Votre code de connexion : ${otp}`,
        });

        return res.status(200).json({
          requires2FA: true,
          userId: user._id,
        });
      } catch (error) {
        console.error("Erreur envoi email 2FA:", error);
        return res.status(500).json({
          message: "Erreur lors de l'envoi du code de sécurité",
        });
      }
    }

    // 5. Génération du Token (Si pas de 2FA)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
<<<<<<< HEAD
      expiresIn: "7d", 
=======
      expiresIn: "7d",
>>>>>>> dev
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      message: "Connexion réussie",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Erreur dans loginUser:", error);
    res.status(500).json({
      message: "Erreur lors de la tentative de connexion",
      error: error.message,
    });
  }
};

// Utilisation de l'otp pour la 2FA
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
<<<<<<< HEAD
      return res
        .status(400)
        .json({ message: "Données manquantes (ID ou Code)" });
=======
      return res.status(400).json({ message: "Données manquantes" });
>>>>>>> dev
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

<<<<<<< HEAD
=======
    await OtpModel.deleteMany({
      userId: user._id,
      type: "email_verification",
      isUsed: false,
    });

>>>>>>> dev
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

<<<<<<< HEAD

=======
>>>>>>> dev
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

    if (!user || user.role !== "admin") {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }

    // Verifier si le compte est deja verifie
    if (user.isAccountVerified) {
      return res.status(400).json({ message: "Ce compte est déjà vérifié" });
    }

    // Générer un OTP à 6 chiffres
    const otp = generateOTP(6);

    // Supprimer les OTPs existants non utilisés pour ce type et utilisateur
<<<<<<< HEAD
    await OtpModel.deleteMany({ userId: user._id, type: "email_verification", isUsed: false });
=======
    await OtpModel.deleteMany({
      userId: user._id,
      type: "email_verification",
      isUsed: false,
    });
>>>>>>> dev

    // Créer un nouvel OTP
    await OtpModel.create({
      userId: user._id,
      type: "email_verification",
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // contruire le mail avec le otp
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Code de vérification de votre email",
      text: `Votre code de vérification est : ${otp}. Il expire dans 10 minutes.`,
    };

<<<<<<< HEAD

=======
>>>>>>> dev
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
<<<<<<< HEAD

=======
>>>>>>> dev
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
<<<<<<< HEAD

=======
>>>>>>> dev
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

// Verifier si user est autentifier ( verifie)
exports.isAuthenticated = async (req, res) => {
  try {
    // On vérifie si req.user existe (injecté par votre middleware auth)
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // On renvoie les infos de l'utilisateur (déjà nettoyées par le middleware idéalement)
    return res.status(200).json({
      success: true,
      message: "Utilisateur authentifié",
      user: req.user,
    });
  } catch (error) {
    console.error("Erreur dans isAuthenticated:", error);
    return res.status(500).json({
      message: "Erreur lors de la vérification de l'authentification",
      error: error.message,
    });
  }
};

// Envoie un OTP pour réinitialiser le mot de passe
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
<<<<<<< HEAD
    await OtpModel.deleteMany({ userId: user._id, type: "reset_password", isUsed: false });
=======
    await OtpModel.deleteMany({
      userId: user._id,
      type: "reset_password",
      isUsed: false,
    });
>>>>>>> dev

    // Créer un nouvel OTP
    await OtpModel.create({
      userId: user._id,
      type: "reset_password",
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

<<<<<<< HEAD

=======
>>>>>>> dev
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
<<<<<<< HEAD
    return res
      .status(400)
      .json({
        message: "Le mot de passe doit contenir au moins 6 caractères",
      });
=======
    return res.status(400).json({
      message: "Le mot de passe doit contenir au moins 6 caractères",
    });
>>>>>>> dev
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
<<<<<<< HEAD
      return res.status(400).json({ message: "Code de réinitialisation invalide ou expiré" });
=======
      return res
        .status(400)
        .json({ message: "Code de réinitialisation invalide ou expiré" });
>>>>>>> dev
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

// Obtenir les infos de l'utilisateur connectee
exports.getUserProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur recuperation profil", error: error.message });
  }
};

// Mis a jour des infos (full name, adress, phone)
exports.updateUser = async (req, res) => {
  try {
    const { fullName, phone, adress } = req.body;
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.userId,
      { $set: { fullName, phone, adress } },
      { new: true, runValidator: true },
    ).select("-password");

    res.status(200).json({ message: "Profil mis a jours", user: updatedUser });
  } catch (error) {
    res
      .status(500)
<<<<<<< HEAD
      .json({ message: "Erreur mis a jour profil", error: error.message });   
=======
      .json({ message: "Erreur mis a jour profil", error: error.message });
>>>>>>> dev
  }
};

// Changer des mot de pass
exports.changePassword = async (req, res) => {
  try {
<<<<<<< HEAD
    const { oldPassword, newPassword } = req.body; 
=======
    const { oldPassword, newPassword } = req.body;
>>>>>>> dev

    // Validation des entrées
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Les deux mots de passe sont requis" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 6 caractères",
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

// Changer la photo de profile
exports.updateProfileImage = async (req, res) => {
  try {
    const userId = req.userId;

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Veuillez sélectionner une image" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Supprimer l'ancienne photo sur Cloudinary
    if (user.profileImage) {
      try {
        // Extraction plus robuste du public_id
        const parts = user.profileImage.split("/");
        const fileName = parts[parts.length - 1]; // ex: "abc123.jpg"
        const publicId = fileName.split(".")[0]; // ex: "abc123"

        // Suppression (nom_du_dossier/public_id)
        await cloudinary.uploader.destroy(`cpms_profiles/${publicId}`);
      } catch (err) {
        console.error("Erreur suppression Cloudinary:", err);
      }
    }

    // 2. Uploader la nouvelle photo
    const result = await new Promise((resolve, reject) => {
      // Correction : resolve
      const uploadStream = cloudinary.uploader.upload_stream(
        // Correction : cloudinary
        {
          folder: "cpms_profiles",
          transformation: [
<<<<<<< HEAD
            { width: 500, height: 500, crop: "fill", gravity: "face" }, 
=======
            { width: 500, height: 500, crop: "fill", gravity: "face" },
>>>>>>> dev
          ],
        },
        (error, result) => {
          if (error) reject(error);
<<<<<<< HEAD
          else resolve(result); 
        },
      );
      uploadStream.end(req.file.buffer); 
=======
          else resolve(result);
        },
      );
      uploadStream.end(req.file.buffer);
>>>>>>> dev
    });

    // Mise à jour en base de données
    user.profileImage = result.secure_url;
    await user.save();

    return res.status(200).json({
      message: "Photo de profil mise à jour avec succès",
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error("Erreur updateProfileImage:", error);
    return res.status(500).json({
      message: "Erreur lors de la mise à jour du profil",
      error: error.message,
    });
  }
};

<<<<<<< HEAD
// Suprimer le user. 
=======
// Suprimer le user.
>>>>>>> dev
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Trouver l'utilisateur
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Supprimer l'image sur Cloudinary si elle existe
    if (user.profileImage && user.profileImage.includes("cloudinary")) {
      try {
<<<<<<< HEAD
        
=======
>>>>>>> dev
        const publicId = getPublicIdFromUrl(user.profileImage);

        // 'cpms_profiles/' si getPublicId ne le fait pas
        await cloudinary.uploader.destroy(publicId);
        console.log("Image Cloudinary supprimée");
      } catch (cloudinaryErr) {
        // On log l'erreur mais on ne bloque pas la suppression du compte
        console.error("Erreur de suppression Cloudinary :", cloudinaryErr);
      }
    }

    // Supprimer l'utilisateur de la base de données
    await UserModel.findByIdAndDelete(userId);

    // Nettoyer le cookie de session
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
<<<<<<< HEAD
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
=======
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
>>>>>>> dev
    });

    return res.status(200).json({
      success: true,
      message: "Votre compte a été supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur dans deleteAccount :", error);
    return res.status(500).json({
      message: "Erreur lors de la suppression du compte",
      error: error.message,
    });
  }
};
<<<<<<< HEAD


// ================== travail de la semaine =============================
// 1. logs et audits
=======
>>>>>>> dev
