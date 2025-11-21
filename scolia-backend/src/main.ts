// scolia-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Autoriser le Frontend (CORS)
  app.enableCors({
    origin: '*', // En prod, on mettra l'URL Vercel ici. Pour l'instant '*' est plus simple pour tester.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // MODIFICATION CRITIQUE POUR RENDER :
  // 1. Utiliser process.env.PORT si disponible
  // 2. Écouter sur 0.0.0.0 (toutes les interfaces réseau)
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
