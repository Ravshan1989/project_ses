import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { json, urlencoded } from "express";
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn", "debug", "verbose"],
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  ); // UZ: CORS xatolarini oldini olish uchun helmet sozlamasi

  // Global Body Limits
  app.use(json({ limit: "100mb" }));
  app.use(urlencoded({ limit: "100mb", extended: true }));

  // Request Logger Middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (res.statusCode >= 400) {
        console.log(
          `[REQ DEBUG] ${req.method} ${req.url} -> ${res.statusCode} (${duration}ms)`,
        );
      }
    });
    next();
  });

  // Enable CORS for Frontend (Standard NestJS way)
  app.enableCors({
    origin: true, // Hamma origin'larga ruxsat berish yoki ro'yxatni kiritish
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    allowedHeaders: "Content-Type, Accept, Authorization, X-Requested-With",
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
