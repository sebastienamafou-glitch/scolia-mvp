import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; // <--- On réactive l'import

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    
    // 🔒 SÉCURITÉ : On compare le mot de passe fourni avec le hash stocké
    // Si 'user.passwordHash' est vide, on tente avec 'user.password' (au cas où)
    // mais toujours via bcrypt.
    
    const hashToTest = user?.passwordHash || user?.password;

    if (user && hashToTest && (await bcrypt.compare(pass, hashToTest))) {
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
