// scolia-backend/src/auth/strategies/jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // 👈 Import du ConfigService

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 👇 CORRECTION : Utilisez getOrThrow pour garantir une string
      // Si votre version de NestJS est ancienne, utilisez : configService.get<string>('JWT_SECRET')!
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Cette méthode n'est appelée que si le token est validé (signature OK)
    // On retourne un objet utilisateur "allégé" qui sera injecté dans request.user
    
    if (!payload) {
      throw new UnauthorizedException();
    }

    return { 
        userId: payload.sub, 
        email: payload.email, 
        role: payload.role,
        schoolId: payload.schoolId 
    };
  }
}
