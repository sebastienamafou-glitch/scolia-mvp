// scolia-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ 1. SÉCURITÉ DES HEADERS HTTP (Anti-XSS, anti-Clickjacking)
  app.use(helmet()); 

  // 2. Configuration du Pipe de Validation GLOBAL
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Ne garde que les propriétés définies dans le DTO (sécurité)
    forbidNonWhitelisted: true, // Rejette les requêtes contenant des champs inconnus
    transform: true,
    disableErrorMessages: false, 
  }));

  // 3. ✅ CONFIGURATION CORS STRICTE
  const frontendDomains = [
      'http://localhost:3000', // Pour le développement local
      'https://scolia.vercel.app', // L'URL de production Vercel
      process.env.FRONTEND_URL, // L'URL dynamique (si vous en avez une)
  ];

  // Filtre les entrées nulles ou vides pour garantir une liste blanche stricte
  const whitelist = frontendDomains.filter(url => url && url.length > 0); 

  app.enableCors({
    origin: whitelist, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Écouter sur toutes les interfaces réseau (Render/Neon)
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
