/**
 * Constantes globales du projet CPMS
 */

// Rôles utilisateur
exports.USER_ROLES = {
  ADMIN: "admin",
  ACCOUNTANT: "accountant",
  SALES: "sales",
  TECHNICIAN: "technician",
};

// Statuts utilisateur
exports.USER_STATUS = {
  ACTIVE: "active",
  BLOCKED: "blocked",
};

// Statuts client
exports.CLIENT_STATUS = {
  ACTIVE: "actif",
  INACTIVE: "inactif",
};

// Types de client
exports.CLIENT_TYPES = {
  PRIVATE: "prive",
  BUSINESS: "entreprise",
  FACTORY: "usine",
};

// Statuts compteur
exports.METER_STATUS = {
  UNASSIGNED: "unassigned",
  ASSIGNED: "assigned",
  ACTIVE: "active",
  INACTIVE: "inactive",
};

// Statuts vente
exports.SALE_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  FAILED: "failed",
};

// Statuts token
exports.TOKEN_STATUS = {
  UNUSED: "unused",
  USED: "used",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
};

// Statuts tarif
exports.RATE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

// Statuts transaction
exports.TRANSACTION_TYPE = {
  SALE: "sale",
  CONSUMPTION: "consumption",
  RECHARGE: "recharge",
  ALERT: "alert",
  PAYMENT: "payment",
};

exports.TRANSACTION_STATUS = {
  COMPLETED: "completed",
  PENDING: "pending",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

// Méthodes de paiement
exports.PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
  MOBILE_MONEY: "mobile_money",
  BANK_TRANSFER: "bank_transfer",
};

// Limites et durées
exports.LIMITS = {
  PASSWORD_MIN_LENGTH: 6,
  OTP_VALIDITY_MINUTES: 10,
  LOGIN_ATTEMPTS_LIMIT: 5,
  LOGIN_LOCKOUT_MINUTES: 15,
  TOKEN_VALIDITY_DAYS: 30,
  SESSION_TIMEOUT_MINUTES: 60,
  MAX_FILE_SIZE_MB: 2,
};

// Formats de fichier acceptés
exports.ALLOWED_FILE_TYPES = {
  IMAGES: ["jpeg", "jpg", "png", "webp"],
};

// Messages d'erreur courants
exports.ERROR_MESSAGES = {
  MISSING_FIELDS: "Tous les champs sont requis",
  INVALID_EMAIL: "Format d'email invalide",
  INVALID_PASSWORD: "Le mot de passe doit contenir au moins 6 caractères",
  USER_EXISTS: "Cet email est déjà utilisé",
  USER_NOT_FOUND: "Utilisateur non trouvé",
  UNAUTHORIZED: "Accès non autorisé",
  FORBIDDEN: "Vous n'avez pas les permissions nécessaires",
  INVALID_TOKEN: "Token invalide ou expiré",
  INVALID_OTP: "Code OTP invalide ou expiré",
  INVALID_CREDENTIALS: "Email ou mot de passe incorrect",
  TOO_MANY_ATTEMPTS: "Trop de tentatives. Veuillez réessayer plus tard.",
  DATABASE_ERROR: "Erreur base de données",
  INTERNAL_ERROR: "Une erreur interne est survenue",
};

// Messages de succès courants
exports.SUCCESS_MESSAGES = {
  USER_CREATED: "Utilisateur créé avec succès",
  USER_UPDATED: "Utilisateur mis à jour avec succès",
  USER_DELETED: "Utilisateur supprimé avec succès",
  LOGIN_SUCCESS: "Connexion réussie",
  LOGOUT_SUCCESS: "Déconnexion réussie",
  EMAIL_SENT: "Email envoyé avec succès",
  OTP_SENT: "Code OTP envoyé par email",
  OPERATION_SUCCESS: "Opération réussie",
  TOKEN_GENERATED: "Token généré avec succès",
};

// Code de réponse HTTP
exports.HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};
