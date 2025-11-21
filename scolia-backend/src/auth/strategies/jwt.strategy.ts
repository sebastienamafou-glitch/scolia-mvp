// scolia-backend/src/auth/strategies/jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  // CORRECTION : Nous reformons l'objet utilisateur à partir du payload
  async validate(payload: any) {
    // Le payload est le contenu du jeton. Il DOIT contenir sub (ID) et role.
    // Nous retournons un objet clair pour req.user
    return { 
        sub: payload.sub, // <-- L'ID utilisateur
        email: payload.email, 
        role: payload.role 
    };
  }
}
