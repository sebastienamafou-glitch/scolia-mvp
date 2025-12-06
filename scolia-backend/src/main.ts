import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
// 👇 Import du filtre d'erreurs (si vous l'avez créé)
import { AllExceptionsFilter } from './http-exception.filter'; 

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuration Proxy pour Render (Important pour https)
  app.set('trust proxy', 1); 

  // Sécurité de base
  app.use(helmet()); 

  // Validation des données entrantes (DTO)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    // ✅ Maintient à false pour éviter les erreurs "property should not exist" inutiles
    forbidNonWhitelisted: false, 
    transform: true,
    disableErrorMessages: process.env.NODE_ENV === 'production', 
  }));

  // ✅ ACTIVATION DU RADAR À BUGS (Filtre Global)
  // Cela permet de voir les erreurs précises dans les logs Render
  app.useGlobalFilters(new AllExceptionsFilter()); 

  // Configuration CORS pour autoriser le Frontend
  const frontendDomains = [
      'http://localhost:3000', 
      'https://scolia.vercel.app', 
      process.env.FRONTEND_URL, 
  ];

  // Nettoyage de la liste (enlève les valeurs vides)
  const whitelist = frontendDomains.filter(url => url && url.length > 0) as string[];

  app.enableCors({
    origin: whitelist, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
