// scolia-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 👈 IMPORT NÉCESSAIRE

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configuration du Pipe de Validation GLOBAL
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Ne garde que les propriétés définies dans le DTO (sécurité)
    forbidNonWhitelisted: true, // Rejette les requêtes contenant des champs inconnus
    transform: true, // Convertit les types (ex: '5' -> 5 pour parentId)
    disableErrorMessages: false, 
  }));

  // 2. Configuration CORS
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
