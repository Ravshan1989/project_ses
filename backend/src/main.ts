import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { json, urlencoded } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn", "debug", "verbose"],
  });

  app.use(json({ limit: "50mb" }));
  app.use(urlencoded({ limit: "50mb", extended: true }));

  // Manual CORS Middleware (UZ: CORS xatolarini aniq hal qilish uchun)
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    } else {
      res.header("Access-Control-Allow-Origin", "*");
    }
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Enable CORS for Frontend (Standard NestJS way as fallback)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Enable Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Global Prefix
  app.setGlobalPrefix("api/v1");

  const port = process.env.PORT || 3007;
  await app.listen(port, "0.0.0.0");
  console.log(`RegionStat Backend running on port ${port} (0.0.0.0)`);
}
bootstrap();

/**
 * ORIGINAL CODE (APPEND-ONLY RULE)
 * 
 * async function bootstrap() {
 *   const app = await NestFactory.create(AppModule, {
 *     logger: ["log", "error", "warn", "debug", "verbose"],
 *   });
 * 
 *   app.use(json({ limit: "50mb" }));
 *   app.use(urlencoded({ limit: "50mb", extended: true }));
 * 
 *   // Enable CORS for Frontend
 *   app.enableCors();
 * 
 *   // Enable Global Validation
 *   app.useGlobalPipes(
 *     new ValidationPipe({
 *       whitelist: true,
 *       transform: true,
 *     }),
 *   );
 * 
 *   // Global Prefix
 *   app.setGlobalPrefix("api/v1");
 * 
 *   const port = process.env.PORT || 3007;
 *   await app.listen(port, "0.0.0.0");
 *   console.log(`RegionStat Backend running on port ${port} (0.0.0.0)`);
 * }
 */
