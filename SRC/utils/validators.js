/**
 * Validateurs personnalisés pour CPMS
 */

const validator = require("validator");
const { ERROR_MESSAGES, LIMITS } = require("./constants");

/**
 * Valide un email
 * @param {string} email
 * @returns {object} { isValid: boolean, error?: string }
 */
exports.validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: "L'email est requis" };
  }

  if (!validator.isEmail(email)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  }

  return { isValid: true };
};

/**
 * Valide un mot de passe
 * @param {string} password
 * @returns {object} { isValid: boolean, error?: string }
 */
exports.validatePassword = (password) => {
  if (!password || !password.trim()) {
    return { isValid: false, error: "Le mot de passe est requis" };
  }

  if (password.length < LIMITS.PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Le mot de passe doit contenir au moins ${LIMITS.PASSWORD_MIN_LENGTH} caractères`,
    };
  }

  return { isValid: true };
};

/**
 * Valide un numéro de téléphone
 * @param {string} phone
 * @returns {object} { isValid: boolean, error?: string }
 */
exports.validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: "Le numéro de téléphone est requis" };
  }

  // Format international: +243XXXXXXXXX ou 0XXXXXXXXX
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: "Format de numéro de téléphone invalide" };
  }

  return { isValid: true };
};

/**
 * Valide un nom complet
 * @param {string} fullName
 * @returns {object} { isValid: boolean, error?: string }
 */
exports.validateFullName = (fullName) => {
  if (!fullName || !fullName.trim()) {
    return { isValid: false, error: "Le nom complet est requis" };
  }

  if (fullName.trim().length < 3) {
    return { isValid: false, error: "Le nom complet doit contenir au moins 3 caractères" };
  }

  return { isValid: true };
};

/**
 * Valide une adresse
 * @param {string} address
 * @returns {object} { isValid: boolean, error?: string }
 */
exports.validateAddress = (address) => {
  if (!address || !address.trim()) {
    return { isValid: false, error: "L'adresse est requise" };
  }

  if (address.trim().length < 5) {
    return { isValid: false, error: "L'adresse doit contenir au moins 5 caractères" };
  }

  return { isValid: true };
};

/**
 * Valide un montant (doit être positif)
 * @param {number} amount
 * @returns {object} { isValid: boolean, error?: string }
 */
exports.validateAmount = (amount) => {
  if (!amount) {
    return { isValid: false, error: "Le montant est requis" };
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, error: "Le montant doit être un nombre positif" };
  }

  return { isValid: true };
};

/**
 * Valide un MongoDB ObjectID
 * @param {string} id
 * @returns {boolean}
 */
exports.isValidMongoId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Valide un rôle utilisateur
 * @param {string} role
 * @param {array} allowedRoles
 * @returns {boolean}
 */
exports.validateRole = (role, allowedRoles = []) => {
  if (allowedRoles.length === 0) {
    return true; // Pas de restriction
  }
  return allowedRoles.includes(role);
};

/**
 * Valide un statut client
 * @param {string} status
 * @returns {boolean}
 */
exports.isValidClientStatus = (status) => {
  return ["actif", "inactif"].includes(status);
};

/**
 * Valide un type de client
 * @param {string} clientType
 * @returns {boolean}
 */
exports.isValidClientType = (clientType) => {
  return ["prive", "entreprise", "usine"].includes(clientType);
};

/**
 * Valide un token de 20 chiffres
 * @param {string} token
 * @returns {object} { isValid: boolean, error?: string }
 */
exports.validateToken = (token) => {
  if (!token || !token.trim()) {
    return { isValid: false, error: "Le token est requis" };
  }

  if (!/^\d{20}$/.test(token)) {
    return { isValid: false, error: "Le token doit contenir exactement 20 chiffres" };
  }

  return { isValid: true };
};

/**
 * Valide un numéro de compteur
 * @param {string} meterNumber
 * @returns {object} { isValid: boolean, error?: string }
 */
exports.validateMeterNumber = (meterNumber) => {
  if (!meterNumber || !meterNumber.trim()) {
    return { isValid: false, error: "Le numéro de compteur est requis" };
  }

  if (meterNumber.trim().length < 3) {
    return { isValid: false, error: "Le numéro de compteur doit contenir au moins 3 caractères" };
  }

  return { isValid: true };
};

/**
 * Normalise un email
 * @param {string} email
 * @returns {string}
 */
exports.normalizeEmail = (email) => {
  return validator.normalizeEmail(email) || email.toLowerCase();
};

/**
 * Trim et lowercase une chaîne
 * @param {string} str
 * @returns {string}
 */
exports.trimAndLowercase = (str) => {
  return str ? str.trim().toLowerCase() : "";
};

/**
 * Valide les champs requis d'un objet
 * @param {object} obj
 * @param {array} requiredFields
 * @returns {object} { isValid: boolean, missingFields?: array }
 */
exports.validateRequiredFields = (obj, requiredFields = []) => {
  const missingFields = requiredFields.filter(
    (field) => !obj[field] || !obj[field].toString().trim()
  );

  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Champs requis manquants: ${missingFields.join(", ")}`,
      missingFields,
    };
  }

  return { isValid: true };
};

/**
 * Valide une méthode de paiement
 * @param {string} paymentMethod
 * @returns {boolean}
 */
exports.isValidPaymentMethod = (paymentMethod) => {
  return ["cash", "card", "mobile_money", "bank_transfer"].includes(paymentMethod);
};
