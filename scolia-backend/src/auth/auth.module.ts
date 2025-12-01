// scolia-backend/src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
// 👇 Changement ici : On importe le Module, pas le Service
import { MailModule } from '../mail/mail.module'; 

@Module({
  imports: [
    UsersModule,
    PassportModule,
    MailModule, // 👈 Import du module Mail pour l'injection correcte
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: '1d' 
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    // ❌ MailService a été retiré d'ici (car géré par MailModule)
  ],
  exports: [AuthService],
})
export class AuthModule {}
