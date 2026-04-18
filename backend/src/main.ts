import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { json, urlencoded } from "express";
import helmet from "helmet";

async function configureApp(app: any) {
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  // Global Body Limits
  app.use(json({ limit: "100mb" }));
  app.use(urlencoded({ limit: "100mb", extended: true }));

  // Enable CORS
  app.enableCors({
    origin: true,
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
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn", "debug", "verbose"],
  });

  await configureApp(app);

  const port = process.env.PORT || 3007;
  await app.listen(port, "0.0.0.0");
  console.log(`RegionStat Backend running on port ${port} (0.0.0.0)`);
  return app;
}

// UZ: Vercel serverless funksiya sifatida ishlashi uchun export qilamiz
let cachedApp: any;
export default async function (req: any, res: any) {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule, {
      logger: ["error", "warn"],
    });
    await configureApp(app);
    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp(req, res);
}

// Local dev uchun bootstrapni faqat Vercel bo'lmaganda chaqiramiz
if (!process.env.VERCEL) {
  bootstrap();
}
