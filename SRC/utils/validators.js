const validator = require("validator");
const { ERROR_MESSAGES, LIMITS } = require("./constants");


exports.validateEmail = (email) => {
  if (!email || !email.trim())  return { isValid: false, error: "L'email est requis" };
  
  if (!validator.isEmail(email)) return { isValid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  
  return { isValid: true };
};

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

exports.validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: "Le numéro de téléphone est requis" };
  }

  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: "Format de numéro de téléphone invalide" };
  }

  return { isValid: true };
};

exports.validateFullName = (fullName) => {
  if (!fullName || !fullName.trim()) {
    return { isValid: false, error: "Le nom complet est requis" };
  }

  if (fullName.trim().length < 3) {
    return { isValid: false, error: "Le nom complet doit contenir au moins 3 caractères" };
  }

  return { isValid: true };
};

exports.validateAddress = (address) => {
  if (!address || !address.trim()) {
    return { isValid: false, error: "L'adresse est requise" };
  }

  if (address.trim().length < 10) {
    return { isValid: false, error: "L'adresse doit contenir au moins 10 caractères" };
  }

  return { isValid: true };
};

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

exports.isValidMongoId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

exports.validateRole = (role, allowedRoles = []) => {
  if (allowedRoles.length === 0) {
    return true; // Pas de restriction
  }
  return allowedRoles.includes(role);
};

exports.isValidClientStatus = (status) => {
  return ["actif", "inactif"].includes(status);
};

exports.isValidClientType = (clientType) => {
  return ["prive", "entreprise", "usine"].includes(clientType);
};

exports.validateToken = (token) => {
  if (!token || !token.trim()) {
    return { isValid: false, error: "Le token est requis" };
  }

  if (!/^\d{20}$/.test(token)) {
    return { isValid: false, error: "Le token doit contenir exactement 20 chiffres" };
  }

  return { isValid: true };
};

exports.validateMeterNumber = (meterNumber) => {
  if (!meterNumber || !meterNumber.trim()) {
    return { isValid: false, error: "Le numéro de compteur est requis" };
  }

  if (meterNumber.trim().length < 3) {
    return { isValid: false, error: "Le numéro de compteur doit contenir au moins 3 caractères" };
  }

  return { isValid: true };
};

exports.normalizeEmail = (email) => {
  return validator.normalizeEmail(email) || email.toLowerCase();
};

exports.trimAndLowercase = (str) => {
  return str ? str.trim().toLowerCase() : "";
};

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

exports.isValidPaymentMethod = (paymentMethod) => {
  return ["cash", "card", "mobile_money", "bank_transfer"].includes(paymentMethod);
};
