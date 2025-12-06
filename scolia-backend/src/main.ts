// scolia-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express'; // Pour augmenter la taille limite du payload

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Activer CORS (Pour que le Frontend React puisse parler au Backend)
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*', // Autoriser Vercel/Localhost
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. Validation Globale (Active les DTOs)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Retire les champs non définis dans le DTO
    transform: true, // Transforme les types (ex: "1" -> 1)
  }));

  // 3. Augmenter la limite de taille (Pour l'import CSV)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // 4. Lancer le serveur
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Serveur Scolia lancé sur le port ${port}`);
}
bootstrap();
