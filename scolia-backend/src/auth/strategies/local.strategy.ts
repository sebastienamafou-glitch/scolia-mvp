// scolia-backend/src/auth/strategies/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // On dit à Passport que le 'username' est notre champ 'email'
    super({ usernameField: 'email' });
  }

  // Cette fonction est appelée automatiquement par Passport
  async validate(email: string, pass: string): Promise<any> {
    const user = await this.authService.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    return user;
  }
}
