const { userAuth } = require("../middlewares/authMiddlewares"); // Vérifie le JWT
const { authorize } = require("../middlewares/roleMiddleware"); // Vérifie le rôle
const { loginLimiter } = require("../middlewares/rateLimiter"); // Anti-brute force
<<<<<<< HEAD
const upload  = require("../middlewares/multer"); // Multer (Cloudinary)
=======
const upload = require("../middlewares/multer"); // Multer (Cloudinary)
>>>>>>> dev
const {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  toggleUserStatus,
  changePassword,
  verifyLoginOtp,
  sendVerifyOtp,
  logoutUser,
  verifyEmail,
  sendResetOtp,
  resetPassword,
<<<<<<< HEAD
  isAuthenticated
=======
  isAuthenticated,
>>>>>>> dev
} = require("../controllers/user.Controller");

const express = require("express");

<<<<<<< HEAD

const userRouter = express.Router();

// Routes protégées (création et gestion des utilisateurs réservées à l'admin)
userRouter.post("/create", userAuth, authorize("admin"), upload.single("image"), createUser);
=======
const userRouter = express.Router();

// Routes protégées (création et gestion des utilisateurs réservées à l'admin)
userRouter.post(
  "/create",
  userAuth,
  authorize("admin", "superAdmin"),
  upload.single("image"),
  createUser,
);
>>>>>>> dev

// Routes publiques
userRouter.post("/login", loginLimiter, loginUser);
userRouter.post("/verify-2fa", verifyLoginOtp);

<<<<<<< HEAD

=======
>>>>>>> dev
// Routes protégées (authentification requise)
userRouter.get("/all", userAuth, authorize("admin"), getAllUsers);
userRouter.get(
  "/:id",
  userAuth,
  authorize("admin", "accountant", "sales", "technician"),
  getUserById,
);
userRouter.put("/:id", userAuth, authorize("admin"), updateUserById);
userRouter.delete("/:id", userAuth, authorize("admin"), deleteUserById);
<<<<<<< HEAD
userRouter.post("/:id/toggle-status", userAuth, authorize("admin"), toggleUserStatus);

=======
userRouter.post(
  "/:id/toggle-status",
  userAuth,
  authorize("admin"),
  toggleUserStatus,
);
>>>>>>> dev

userRouter.post("/change-password", userAuth, changePassword);
userRouter.post("/logout", userAuth, logoutUser);

userRouter.get("/is-authenticated", userAuth, isAuthenticated); // verifier les utilisateurs qui sont connecter

// reset password
userRouter.post("/send-reset-otp", sendResetOtp);
userRouter.post("/reset-password", resetPassword);

// OTP Email, verify
userRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
userRouter.post("/verify-account", userAuth, verifyEmail);

<<<<<<< HEAD
module.exports = userRouter;
=======
module.exports = userRouter;
>>>>>>> dev
