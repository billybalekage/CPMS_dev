const crypto = require("crypto");

class TokenGeneratorService {
  constructor() {
    this.secretKey = process.env.TOKEN_SECRET_KEY || process.env.JWT_SECRET;
    if (!this.secretKey) {
      throw new Error("TOKEN_SECRET_KEY or JWT_SECRET must be defined in .env");
    }
  }

  /**
   * Génère un TOKEN unique de 20 chiffres basé sur les paramètres de la vente
   * @param {Object} params - Paramètres de génération
   * @param {string} params.saleId - ID de la vente
   * @param {string} params.meterId - ID du compteur
   * @param {string} params.meterNumber - Numéro du compteur
   * @param {string} params.clientType - Type de client (prive, entreprise, usine)
   * @param {string} params.clientId - ID du client
   * @param {number} params.amount - Montant en unités
   * @returns {string} Token de 20 chiffres
   */
  generateToken(params) {
    const { saleId, meterId, meterNumber, clientType, clientId, amount } =
      params;

    if (!saleId || !meterId || !clientType || !clientId || !amount) {
      throw new Error("Tous les paramètres sont requis pour générer un token");
    }

    const dataToHash = `${saleId}:${meterId}:${meterNumber || ""}:${clientType}:${clientId}:${amount}`;

    // 2. Générer un HMAC-SHA256 avec la clé secrète
    const hmac = crypto
      .createHmac("sha256", this.secretKey)
      .update(dataToHash)
      .digest("hex");

    // 3. Générer un token stable de 20 chiffres
    const hashDigits = this.hexToDigits(hmac.substring(0, 20), 10);
    const token = hashDigits.padStart(20, "0");

    return token;
  }

  /**
   * Convertit une chaîne hex en chiffres décimaux
   * @private
   */
  hexToDigits(hexString, length) {
    // Convertir hex en entier, puis prendre modulo 10^length
    const maxValue = Math.pow(10, length);
    const hexValue = parseInt(hexString, 16);
    const digitValue = hexValue % maxValue;
    return digitValue.toString().padStart(length, "0");
  }

  /**
   * Valide que le token correspond aux paramètres
   * @param {string} token - Token à valider
   * @param {Object} params - Paramètres pour recalculer
   * @returns {boolean} true si valid
   */
  validateToken(token, params) {
    try {
      const regeneratedToken = this.generateToken(params);
      return token === regeneratedToken;
    } catch (error) {
      console.error("Erreur validation token:", error);
      return false;
    }
  }

  /**
   * Génère une somme de contrôle basée sur les paramètres critiques
   * @private
   */
  generateChecksum(saleId, meterId, amount) {
    const checkData = `${saleId}${meterId}${amount}`;
    const hash = crypto.createHash("md5").update(checkData).digest("hex");
    return hash.substring(0, 4);
  }

  /**
   * Décode le token pour extraire les infos
   * @param {string} token - Token à décoder (20 chiffres)
   * @returns {Object} Informations extraites
   */
  decodeToken(token) {
    if (!/^\d{20}$/.test(token)) {
      throw new Error("Token invalide (doit contenir exactement 20 chiffres)");
    }

    // Format : [10 chiffres timestamp][10 chiffres hash]
    const timestampDigits = token.substring(0, 10);
    const hashDigits = token.substring(10, 20);

    return {
      timestampDigits: timestampDigits,
      hashDigits: hashDigits,
      length: token.length,
    };
  }

  /**
   * Génère une version courte du token pour affichage
   * (pour éviter de montrer la clé secrète)
   */
  generateTokenShort(params) {
    const fullToken = this.generateToken(params);
    // Retourner les 6 premiers + les 4 derniers chiffres
    return `${fullToken.substring(0, 6)}****${fullToken.substring(fullToken.length - 4)}`;
  }
}

module.exports = new TokenGeneratorService();
