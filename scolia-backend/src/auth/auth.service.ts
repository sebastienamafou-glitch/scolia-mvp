// scolia-backend/src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; 

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    
    // CORRECTION CRITIQUE : Restauration de la vérification BCrypt
    if (user && user.passwordHash && (await bcrypt.compare(pass, user.passwordHash))) {
      // On retire le hash avant de renvoyer l'utilisateur
      const { passwordHash, ...result } = user; 
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
