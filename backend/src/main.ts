import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Frontend
  app.enableCors();

  // Enable Global Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3007;
  await app.listen(port);
  console.log(`RegionStat Backend running on port ${port}`);
}
bootstrap();
