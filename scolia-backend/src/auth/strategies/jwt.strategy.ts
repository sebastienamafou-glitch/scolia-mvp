import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants'; // Assurez-vous que le chemin est bon

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret, // Doit être la même clé que dans AuthModule
    });
  }

  // Cette méthode s'exécute si le token est valide (signature OK)
  async validate(payload: any) {
    // On renvoie directement les infos contenues dans le token
    // Elles seront accessibles via req.user dans les contrôleurs
    return { 
        userId: payload.sub, // L'ID utilisateur
        sub: payload.sub,    // Alias utile
        email: payload.email, 
        role: payload.role,
        schoolId: payload.schoolId 
    };
  }
}
