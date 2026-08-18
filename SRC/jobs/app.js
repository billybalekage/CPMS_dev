const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const swaggerJsdoc = require("swagger-jsdoc");
const multer = require("multer");
const swaggerUi = require("swagger-ui-express");
const { env, corsOrigins } = require("./config");
const authRouter = require("../routes/auth.Route");
const userRouter = require("../routes/user.Route");
const clientRouter = require("../routes/client.Route");
const meterRouter = require("../routes/meter.Route");
const saleRouter = require("../routes/sale.Route");
const rateRouter = require("../routes/rate.Route");
const dashboardRouter = require("../routes/dashboard.Route");

const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(
    express.urlencoded({ extended: true, limit: env.REQUEST_SIZE_LIMIT }),
  );

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-Request-ID",
      ],
    }),
  );

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      hsts: {
        maxAge: 63072000,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      frameguard: { action: "deny" },
      crossOriginEmbedderPolicy: true,
      crossOriginResourcePolicy: { policy: "same-origin" },
      dnsPrefetchControl: { allow: false },
      originAgentCluster: true,
      hidePoweredBy: true,
    }),
  );

  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "L'image est trop lourde (max 2Mo)" });
      }
      return res
        .status(400)
        .json({ message: `Erreur d'upload: ${err.message}` });
    }

    next(err);
  });

  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "API CPMS",
        version: "1.0.0",
        description: "Documentation automatique de l'API",
      },
    },
    apis: ["./SRC/**/*.js", "./src/**/*.js"],
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/docs.json", (_req, res) => res.json(swaggerSpec));

  app.use((req, res, next) => {
    res.locals.cookieOptions = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: env.COOKIE_MAX_AGE_MS,
    };
    next();
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/clients", clientRouter);
  app.use("/api/v1/meters", meterRouter);
  app.use("/api/v1/sales", saleRouter);
  app.use("/api/v1/rates", rateRouter);
  app.use("/api/v1/dashboard", dashboardRouter);

  return app;
};

module.exports = createApp;
