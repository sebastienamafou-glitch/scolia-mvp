// scolia-backend/src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy'; 
import { LocalStrategy } from './strategies/local.strategy'; // Assurez-vous d'importer LocalStrategy aussi
import { MailService } from '../mail/mail.service';
import { ConfigModule } from '@nestjs/config'; // Optionnel mais recommandé

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule.forRoot(), // Pour lire le .env localement
    JwtModule.register({
      // 👇 CORRECTION MAJEURE ICI : On utilise la variable d'environnement
      secret: process.env.JWT_SECRET || 'secret_de_secours_pour_dev_local', 
      signOptions: { expiresIn: '1d' }, // J'ai mis 1 jour (1d) au lieu de 60m pour plus de confort
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    LocalStrategy, // Ajoutez LocalStrategy ici si elle manquait
    JwtStrategy, 
    MailService
  ],
  exports: [AuthService],
})
export class AuthModule {}
