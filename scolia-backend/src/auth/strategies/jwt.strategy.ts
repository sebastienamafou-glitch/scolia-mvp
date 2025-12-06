// scolia-backend/src/auth/strategies/jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../roles.decorator';

interface JwtPayload {
  sub: number; // 👈 Modifié en number car user.id est un number dans auth.service
  email: string;
  role: UserRole;
  schoolId: number; // 👈 Modifié en number
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload) {
      throw new UnauthorizedException();
    }

    // Retourne l'objet user qui sera injecté dans request.user
    return { 
        id: payload.sub, // On mappe 'sub' vers 'id' pour plus de clarté dans les controlleurs
        email: payload.email, 
        role: payload.role,
        schoolId: payload.schoolId 
    };
  }
}
