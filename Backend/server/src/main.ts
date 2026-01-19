import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { config } from 'dotenv';
import { existsSync, mkdirSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

// Load env variables FIRST, before any modules
config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

//validations
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ---------- CORS ----------
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    // Allow the Authorization header so the browser can send Bearer tokens
    allowedHeaders: 'Content-Type,Authorization',
    exposedHeaders: 'Authorization',
  });

  // ---------- Ensure uploads folders exist ----------
  const uploadsRoot = join(__dirname, '..', 'uploads');
  const productsPath = join(uploadsRoot, 'products');

  if (!existsSync(productsPath)) {
    mkdirSync(productsPath, { recursive: true });
    console.log('Created uploads folder →', productsPath);
  }

  // ---------- Serve static files ----------
  // This will expose: http://localhost:5000/uploads/products/filename.jpg
  app.useStaticAssets(uploadsRoot, {
    prefix: '/uploads',
  });

  // ---------- Start Server ----------
  const port = process.env.PORT ? Number(process.env.PORT) : 5000;
  await app.listen(port);

  console.log(`\n🚀 Server running on http://localhost:${port}`);
  console.log(`📂 Static images available at http://localhost:${port}/uploads/...`);
}

bootstrap();
