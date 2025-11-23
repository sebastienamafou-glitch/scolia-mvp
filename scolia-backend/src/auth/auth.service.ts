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
    
    // On conserve la comparaison sécurisée (Bcrypt) compatible avec votre User Entity
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      // On retire le hash du résultat renvoyé
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    // C'EST ICI QUE TOUT SE JOUE :
    const payload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role,
        schoolId: user.schoolId // <--- ON AJOUTE L'ID ECOLE
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
