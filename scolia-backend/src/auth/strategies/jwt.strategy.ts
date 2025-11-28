import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
// Assurez-vous que ce chemin vers constants est correct pour votre projet
import { jwtConstants } from '../constants'; 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret, // Doit correspondre à la clé de signature
    });
  }

  // ✅ CORRECTION : Validation "Stateless"
  // On ne fait pas d'appel à la base de données ici. 
  // Si la signature du token est bonne, on accepte le payload.
  async validate(payload: any) {
    return { 
        userId: payload.sub, 
        email: payload.email, 
        role: payload.role,
        schoolId: payload.schoolId 
    };
  }
}
