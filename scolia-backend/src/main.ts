// scolia-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet'; // 👈 IMPORT DE HELMET

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ 1. SÉCURITÉ DES HEADERS HTTP
  app.use(helmet()); 

  // 2. Configuration du Pipe de Validation GLOBAL
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Ne garde que les propriétés définies dans le DTO (sécurité)
    forbidNonWhitelisted: true, // Rejette les requêtes contenant des champs inconnus
    transform: true,
    disableErrorMessages: false, 
  }));

  // 3. Configuration CORS (Déjà faite)
  app.enableCors({
    origin: ['http://localhost:3000', 'https://scolia.vercel.app', process.env.FRONTEND_URL], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Écouter sur toutes les interfaces réseau (Render/Neon)
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
