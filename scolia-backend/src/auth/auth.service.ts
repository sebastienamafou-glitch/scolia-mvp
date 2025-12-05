// scolia-backend/src/auth/auth.service.ts

import { Injectable, BadRequestException, NotFoundException, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; 
import { MailService } from '../mail/mail.service'; 

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    // 1. Normalisation de l'email (minuscule) pour éviter les erreurs de casse
    const cleanEmail = email.toLowerCase().trim();
    
    const user = await this.usersService.findOneByEmail(cleanEmail);
    
    if (!user) {
        this.logger.warn(`Tentative de connexion échouée : Email introuvable (${cleanEmail})`);
        return null;
    }

    if (!user.passwordHash) {
        this.logger.error(`Utilisateur ${cleanEmail} n'a pas de mot de passe défini.`);
        return null;
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    
    if (isMatch) {
      const { passwordHash, ...result } = user; 
      return result;
    } else {
      this.logger.warn(`Tentative de connexion échouée : Mot de passe incorrect pour ${cleanEmail}`);
      return null;
    }
  }

  async login(user: any) {
    if (!user) throw new UnauthorizedException("Identifiants incorrects");

    const finalSchoolId = user.school?.id || user.schoolId;

    const payload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role,
        schoolId: finalSchoolId 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email.toLowerCase().trim());
    if (!user) {
      throw new NotFoundException("Aucun utilisateur avec cet email.");
    }

    const payload = { sub: user.id, type: 'reset' };
    const token = this.jwtService.sign(payload, { expiresIn: '15m' });

    await this.mailService.sendResetPasswordEmail(user.email, token);

    return { message: 'Email de réinitialisation envoyé.' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      
      if (payload.type !== 'reset') {
        throw new BadRequestException("Token invalide.");
      }

      const userId = payload.sub;
      await this.usersService.updatePassword(userId, newPassword);

      return { message: 'Mot de passe modifié avec succès.' };

    } catch (error) {
      throw new BadRequestException("Le lien est invalide ou a expiré.");
    }
  }
}
