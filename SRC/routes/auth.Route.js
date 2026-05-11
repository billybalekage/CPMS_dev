const express = require("express");

// Import des Middlewares
const { userAuth } = require("../middlewares/authMiddlewares"); // Vérifie le JWT
const { authorize } = require("../middlewares/roleMiddleware"); // Vérifie le rôle
const { loginLimiter } = require("../middlewares/rateLimiter"); // Anti-brute force
const upload  = require("../middlewares/multer"); // Multer (Cloudinary)

// Import des Contrôleurs
const {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  sendVerifyOtp,
  sendResetOtp,
  resetPassword,
  verifyLoginOtp,
  isAuthenticated,
  getUserProfile,
  updateUser,
  changePassword,
  updateProfileImage,
  deleteAccount,
} = require("../controllers/auth.controller");

const authRouter = express.Router();

// --- ROUTES PUBLIQUES (Pas de middleware d'auth ici) ---
// Note: Le contrôle du rôle "admin" se fait DIRECTEMENT dans le loginUser controller
authRouter.post("/login", loginLimiter, loginUser);
authRouter.post("/verify-2fa", verifyLoginOtp);

// --- ROUTES PROTÉGÉES (Admin Connecté Uniquement) ---
authRouter.post(
  "/register",
  userAuth,
  authorize("admin"),
  upload.single("image"),
  registerUser,
);

authRouter.post("/logout", userAuth, authorize("admin"), logoutUser);

authRouter.post(
  "/send-verify-otp",
  userAuth,
  authorize("admin"),
  sendVerifyOtp,
);
authRouter.post("/verify-account", userAuth, authorize("admin"), verifyEmail);
authRouter.get(
  "/is-authenticated",
  userAuth,
  authorize("admin"),
  isAuthenticated,
);

// --- PASSWORD RESET (POST est plus sécurisé que GET) ---
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);

// --- PROFIL ADMIN ---
authRouter.get("/profile", userAuth, authorize("admin"), getUserProfile);
authRouter.put("/update-profile", userAuth, authorize("admin"), updateUser);
authRouter.put(
  "/change-password",
  userAuth,
  authorize("admin"),
  changePassword,
);
authRouter.put(
  "/update-profile-image",
  userAuth,
  authorize("admin"),
  upload.single("image"),
  updateProfileImage,
);
authRouter.delete(
  "/:id/delete-account",
  userAuth,
  authorize("admin"),
  deleteAccount,
);

module.exports = authRouter;