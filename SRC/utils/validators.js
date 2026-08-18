<<<<<<< HEAD
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
=======
const validator = require("validator");
const { ERROR_MESSAGES, LIMITS } = require("./constants");


exports.validateEmail = (email) => {
  if (!email || !email.trim())  return { isValid: false, error: "L'email est requis" };
  
  if (!validator.isEmail(email)) return { isValid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  
  return { isValid: true };
};

>>>>>>> dev
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

<<<<<<< HEAD
/**
 * Valide un numéro de téléphone
 * @param {string} phone
 * @returns {object} { isValid: boolean, error?: string }
 */
=======
>>>>>>> dev
exports.validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: "Le numéro de téléphone est requis" };
  }

<<<<<<< HEAD
  // Format international: +243XXXXXXXXX ou 0XXXXXXXXX
=======
>>>>>>> dev
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: "Format de numéro de téléphone invalide" };
  }

  return { isValid: true };
};

<<<<<<< HEAD
/**
 * Valide un nom complet
 * @param {string} fullName
 * @returns {object} { isValid: boolean, error?: string }
 */
=======
>>>>>>> dev
exports.validateFullName = (fullName) => {
  if (!fullName || !fullName.trim()) {
    return { isValid: false, error: "Le nom complet est requis" };
  }

  if (fullName.trim().length < 3) {
    return { isValid: false, error: "Le nom complet doit contenir au moins 3 caractères" };
  }

  return { isValid: true };
};

<<<<<<< HEAD
/**
 * Valide une adresse
 * @param {string} address
 * @returns {object} { isValid: boolean, error?: string }
 */
=======
>>>>>>> dev
exports.validateAddress = (address) => {
  if (!address || !address.trim()) {
    return { isValid: false, error: "L'adresse est requise" };
  }

<<<<<<< HEAD
  if (address.trim().length < 5) {
    return { isValid: false, error: "L'adresse doit contenir au moins 5 caractères" };
=======
  if (address.trim().length < 10) {
    return { isValid: false, error: "L'adresse doit contenir au moins 10 caractères" };
>>>>>>> dev
  }

  return { isValid: true };
};

<<<<<<< HEAD
/**
 * Valide un montant (doit être positif)
 * @param {number} amount
 * @returns {object} { isValid: boolean, error?: string }
 */
=======
>>>>>>> dev
exports.validateAmount = (amount) => {
  if (!amount) {
    return { isValid: false, error: "Le montant est requis" };
  }

<<<<<<< HEAD
  const numAmount = Number(amount);
=======
  const numAmount = Number(amount); 
>>>>>>> dev
  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, error: "Le montant doit être un nombre positif" };
  }

  return { isValid: true };
};

<<<<<<< HEAD
/**
 * Valide un MongoDB ObjectID
 * @param {string} id
 * @returns {boolean}
 */
=======
>>>>>>> dev
exports.isValidMongoId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

<<<<<<< HEAD
/**
 * Valide un rôle utilisateur
 * @param {string} role
 * @param {array} allowedRoles
 * @returns {boolean}
 */
=======
>>>>>>> dev
exports.validateRole = (role, allowedRoles = []) => {
  if (allowedRoles.length === 0) {
    return true; // Pas de restriction
  }
  return allowedRoles.includes(role);
};

<<<<<<< HEAD
/**
 * Valide un statut client
 * @param {string} status
 * @returns {boolean}
 */
=======
>>>>>>> dev
exports.isValidClientStatus = (status) => {
  return ["actif", "inactif"].includes(status);
};

<<<<<<< HEAD
/**
 * Valide un type de client
 * @param {string} clientType
 * @returns {boolean}
 */
=======
>>>>>>> dev
exports.isValidClientType = (clientType) => {
  return ["prive", "entreprise", "usine"].includes(clientType);
};

<<<<<<< HEAD
/**
 * Valide un token de 20 chiffres
 * @param {string} token
 * @returns {object} { isValid: boolean, error?: string }
 */
=======
>>>>>>> dev
exports.validateToken = (token) => {
  if (!token || !token.trim()) {
    return { isValid: false, error: "Le token est requis" };
  }

  if (!/^\d{20}$/.test(token)) {
    return { isValid: false, error: "Le token doit contenir exactement 20 chiffres" };
  }

  return { isValid: true };
};

<<<<<<< HEAD
/**
 * Valide un numéro de compteur
 * @param {string} meterNumber
 * @returns {object} { isValid: boolean, error?: string }
 */
=======
>>>>>>> dev
exports.validateMeterNumber = (meterNumber) => {
  if (!meterNumber || !meterNumber.trim()) {
    return { isValid: false, error: "Le numéro de compteur est requis" };
  }

  if (meterNumber.trim().length < 3) {
    return { isValid: false, error: "Le numéro de compteur doit contenir au moins 3 caractères" };
  }

  return { isValid: true };
};

<<<<<<< HEAD
/**
 * Normalise un email
 * @param {string} email
 * @returns {string}
 */
=======
>>>>>>> dev
exports.normalizeEmail = (email) => {
  return validator.normalizeEmail(email) || email.toLowerCase();
};

<<<<<<< HEAD
/**
 * Trim et lowercase une chaîne
 * @param {string} str
 * @returns {string}
 */
=======
>>>>>>> dev
exports.trimAndLowercase = (str) => {
  return str ? str.trim().toLowerCase() : "";
};

<<<<<<< HEAD
/**
 * Valide les champs requis d'un objet
 * @param {object} obj
 * @param {array} requiredFields
 * @returns {object} { isValid: boolean, missingFields?: array }
 */
=======
>>>>>>> dev
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

<<<<<<< HEAD
/**
 * Valide une méthode de paiement
 * @param {string} paymentMethod
 * @returns {boolean}
 */
=======
>>>>>>> dev
exports.isValidPaymentMethod = (paymentMethod) => {
  return ["cash", "card", "mobile_money", "bank_transfer"].includes(paymentMethod);
};
