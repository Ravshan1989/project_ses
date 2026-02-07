import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Enable CORS for Frontend
  app.enableCors();

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
