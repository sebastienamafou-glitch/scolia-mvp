// scolia-backend/src/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../roles.decorator'; // Import de l'Enum

// ✅ AJOUT : Interface pour typer le Payload du Token
interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  schoolId: string;
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

    // ✅ Retourne un objet typé. 
    // Important : schoolId est crucial pour le cloisonnement des données (CDC Page 1, 2.2) 
    return { 
        userId: payload.sub, 
        email: payload.email, 
        role: payload.role,
        schoolId: payload.schoolId 
    };
  }
}
