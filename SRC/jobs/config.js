const Joi = require("joi");

const FALLBACK_JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET ||
  "dev-access-secret-key-change-me-please-123456";
const FALLBACK_JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "dev-refresh-secret-key-change-me-please-987654";

if (!process.env.DB_URL && process.env.DATABASE_URL) {
  process.env.DB_URL = process.env.DATABASE_URL;
}
if (!process.env.MONGO_URI && process.env.DB_URL) {
  process.env.MONGO_URI = process.env.DB_URL;
}
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = "mongodb://localhost:27017/cpms_db";
}

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default(process.env.NODE_ENV || "development"),
  PORT: Joi.number().integer().min(1).max(65535).default(7000),
  CORS_ORIGINS: Joi.string().allow("", null).default(""),
  CLIENT_URL: Joi.string().uri().default("http://localhost:5173"),
  ARDUINO_URL: Joi.string().uri().default("http://localhost:8000"),
  REQUEST_SIZE_LIMIT: Joi.string().default("10mb"),
  RATE_LIMIT_MAX_PUBLIC: Joi.number().integer().default(100),
  RATE_LIMIT_MAX_PRIVATE: Joi.number().integer().default(300),
  RATE_LIMIT_MAX_AUTH: Joi.number().integer().default(20),
  RATE_LIMIT_MAX_UPLOAD: Joi.number().integer().default(10),
  RATE_LIMIT_WINDOW_MS: Joi.number()
    .integer()
    .default(15 * 60 * 1000),
  KEEP_ALIVE_TIMEOUT: Joi.number().integer().default(61000),
  HEADERS_TIMEOUT: Joi.number().integer().default(65000),
  REQUEST_TIMEOUT: Joi.number().integer().default(120000),
  COOKIE_MAX_AGE_MS: Joi.number()
    .integer()
    .default(24 * 60 * 60 * 1000),
  LOG_LEVEL: Joi.string()
    .valid("fatal", "error", "warn", "info", "debug", "trace")
    .default(process.env.LOG_LEVEL || "info"),
  MONGO_URI: Joi.string()
    .uri({ allowRelative: false })
    .default(process.env.MONGO_URI),
  JWT_SECRET: Joi.string()
    .allow("", null)
    .default(process.env.JWT_SECRET || FALLBACK_JWT_ACCESS_SECRET),
  jwt: Joi.object({
    accessSecret: Joi.string().allow("").default(FALLBACK_JWT_ACCESS_SECRET),
    refreshSecret: Joi.string().allow("").default(FALLBACK_JWT_REFRESH_SECRET),
    accessExpiresInMinutes: Joi.number().default(
      Number(process.env.JWT_ACCESS_EXPIRES_IN_MINUTES) || 15,
    ),
    refreshExpiresInDays: Joi.number().default(
      Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS) || 30,
    ),
  }).default({}),
  smtp: Joi.object({
    host: Joi.string()
      .allow("", null)
      .default(process.env.SMTP_HOST || ""),
    port: Joi.number().default(Number(process.env.SMTP_PORT) || 587),
    user: Joi.string()
      .allow("", null)
      .default(process.env.SMTP_USER || ""),
    pass: Joi.string()
      .allow("", null)
      .default(process.env.SMTP_PASS || ""),
    fromName: Joi.string().default(process.env.SMTP_FROM_NAME || "No Reply"),
    fromEmail: Joi.string().default(
      process.env.SMTP_FROM_EMAIL || "no-reply@example.com",
    ),
  }).default({}),
}).unknown(true);

const normalizedEnv = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 7000,
  CORS_ORIGINS: process.env.CORS_ORIGINS || "",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  ARDUINO_URL: process.env.ARDUINO_URL || "http://localhost:8000",
  REQUEST_SIZE_LIMIT: process.env.REQUEST_SIZE_LIMIT || "10mb",
  RATE_LIMIT_MAX_PUBLIC: Number(process.env.RATE_LIMIT_MAX_PUBLIC) || 100,
  RATE_LIMIT_MAX_PRIVATE: Number(process.env.RATE_LIMIT_MAX_PRIVATE) || 300,
  RATE_LIMIT_MAX_AUTH: Number(process.env.RATE_LIMIT_MAX_AUTH) || 20,
  RATE_LIMIT_MAX_UPLOAD: Number(process.env.RATE_LIMIT_MAX_UPLOAD) || 10,
  RATE_LIMIT_WINDOW_MS:
    Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  KEEP_ALIVE_TIMEOUT: Number(process.env.KEEP_ALIVE_TIMEOUT) || 61000,
  HEADERS_TIMEOUT: Number(process.env.HEADERS_TIMEOUT) || 65000,
  REQUEST_TIMEOUT: Number(process.env.REQUEST_TIMEOUT) || 120000,
  COOKIE_MAX_AGE_MS:
    Number(process.env.COOKIE_MAX_AGE_MS) || 24 * 60 * 60 * 1000,
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  MONGO_URI:
    process.env.MONGO_URI ||
    process.env.DB_URL ||
    "mongodb://localhost:27017/cpms_db",
  JWT_SECRET: process.env.JWT_SECRET || FALLBACK_JWT_ACCESS_SECRET,
  jwt: {
    accessSecret: FALLBACK_JWT_ACCESS_SECRET,
    refreshSecret: FALLBACK_JWT_REFRESH_SECRET,
    accessExpiresInMinutes:
      Number(process.env.JWT_ACCESS_EXPIRES_IN_MINUTES) || 15,
    refreshExpiresInDays: Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS) || 30,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    fromName: process.env.SMTP_FROM_NAME || "No Reply",
    fromEmail: process.env.SMTP_FROM_EMAIL || "no-reply@example.com",
  },
};

const { value: env, error } = envSchema.validate(normalizedEnv, {
  abortEarly: false,
  convert: true,
});

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

const corsOrigins = (
  env.CORS_ORIGINS ||
  env.CLIENT_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: env.COOKIE_MAX_AGE_MS,
};

const isProduction = env.NODE_ENV === "production";

module.exports = {
  env,
  corsOrigins,
  cookieOptions,
  isProduction,
};
