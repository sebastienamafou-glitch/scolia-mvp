// scolia-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuration Proxy pour Render
  app.set('trust proxy', 1); 

  app.use(helmet()); 

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    // 👇 MODIFICATION ICI : On passe à false pour ne pas bloquer les champs inconnus
    forbidNonWhitelisted: false, 
    transform: true,
    disableErrorMessages: process.env.NODE_ENV === 'production', 
  }));

  const frontendDomains = [
      'http://localhost:3000', 
      'https://scolia.vercel.app', 
      process.env.FRONTEND_URL, 
  ];

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
