const crypto = require("crypto");

const DEFAULT_PREFIXES = {
  usine: "160",
  entreprise: "170",
  prive: "180",
};

const getPrefixFromEnv = () => ({
  usine: String(process.env.METER_TYPE_USINE || DEFAULT_PREFIXES.usine).trim(),
  entreprise: String(
    process.env.METER_TYPE_ENTREPRISE || DEFAULT_PREFIXES.entreprise,
  ).trim(),
  prive: String(process.env.METER_TYPE_PRIVE || DEFAULT_PREFIXES.prive).trim(),
});

const normalizeMeterType = (meterType) => {
  if (!meterType) return null;
  const normalized = String(meterType).trim().toLowerCase();
  if (!normalized) return null;
  return normalized;
};

const getMeterPrefixByType = (meterType) => {
  const value = normalizeMeterType(meterType);
  if (!value) return null;

  const prefixes = getPrefixFromEnv();
  const numericValue = value.replace(/^0+/, "");

  if (/^\d+$/.test(value)) {
    const candidate = value.length === 3 ? value : numericValue;
    if (
      [prefixes.usine, prefixes.entreprise, prefixes.prive].includes(candidate)
    ) {
      return candidate;
    }
  }

  switch (value) {
    case "usine":
    case "factory":
    case "industries":
      return prefixes.usine;
    case "entreprise":
    case "business":
      return prefixes.entreprise;
    case "prive":
    case "private":
      return prefixes.prive;
    default:
      return null;
  }
};

const generateMeterSuffix = () => {
  return crypto.randomInt(0, 1_000_000_000).toString().padStart(9, "0");
};

const generateMeterNumber = (prefix) => {
  const prefixString = String(prefix || "").trim();
  if (!/^\d{3}$/.test(prefixString)) {
    throw new Error(
      "Prefix de compteur invalide. Il doit contenir 3 chiffres.",
    );
  }
  return `${prefixString}${generateMeterSuffix()}`;
};

const generateUniqueMeterNumber = async (
  prefix,
  doesMeterExist,
  attempts = 10,
) => {
  if (typeof doesMeterExist !== "function") {
    throw new Error(
      "Une fonction de vérification de l'existence du compteur est requise.",
    );
  }

  for (let i = 0; i < attempts; i += 1) {
    const candidate = generateMeterNumber(prefix);
    const exists = await doesMeterExist(candidate);
    if (!exists) {
      return candidate;
    }
  }

  throw new Error(
    "Impossible de générer un numéro de compteur unique après plusieurs tentatives.",
  );
};

const getClientTypeFromMeter = (meterNumber) => {
  if (!meterNumber || typeof meterNumber !== "string") {
    return "unknown";
  }

  const prefixes = getPrefixFromEnv();
  const prefix = meterNumber.substring(0, 3);

  switch (prefix) {
    case prefixes.prive:
      return "prive";
    case prefixes.entreprise:
      return "entreprise";
    case prefixes.usine:
      return "usine";
    default:
      return "unknown";
  }
};

module.exports = {
  getMeterPrefixByType,
  generateMeterNumber,
  generateUniqueMeterNumber,
  getClientTypeFromMeter,
};
