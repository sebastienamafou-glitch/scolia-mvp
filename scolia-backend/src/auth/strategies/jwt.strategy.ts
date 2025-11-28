// scolia-backend/src/auth/strategies/jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 👇 CORRECTION MAJEURE ICI : Doit être IDENTIQUE à auth.module.ts
      secretOrKey: process.env.JWT_SECRET || 'secret_de_secours_pour_dev_local',
    });
  }

  async validate(payload: any) {
    // Si on arrive ici, c'est que la signature est VALIDE (401 résolu)
    return { 
        userId: payload.sub, 
        email: payload.email, 
        role: payload.role,
        schoolId: payload.schoolId 
    };
  }
}
