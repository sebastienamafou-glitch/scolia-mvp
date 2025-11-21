// scolia-backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // <-- On importe le module Users
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { LocalStrategy } from './strategies/local.strategy'; // <-- Notre garde "login"
import { JwtStrategy } from './strategies/jwt.strategy';   // <-- Notre garde "token"

@Module({
  imports: [
    UsersModule, // On a besoin du UsersService
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' }, // Le token expire après 1 jour
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy], // On déclare nos 3 services/stratégies
})
export class AuthModule {}
