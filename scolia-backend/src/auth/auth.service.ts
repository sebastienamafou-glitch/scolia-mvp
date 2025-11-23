// scolia-backend/src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; // L'import est conservé, mais l'usage est supprimé dans validateUser

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    
    // Remplacement de la logique de validation sécurisée par une comparaison simple (===)
    // NOTE : Cela suppose que 'user.password' contient le mot de passe en clair.
    if (user && user.password === pass) {
      // On retire les infos sensibles avant de renvoyer l'utilisateur
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, passwordHash, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(user: any) {
    const payload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role,
        schoolId: user.schoolId 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
