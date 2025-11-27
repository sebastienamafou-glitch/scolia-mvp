// scolia-backend/src/auth/auth.service.ts

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; 
// 👇 Import du MailService (Assurez-vous de l'avoir créé comme vu précédemment)
import { MailService } from '../mail/mail.service'; 

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService, // 👈 Injection du service mail
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    
    if (user && user.passwordHash && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user; 
      return result;
    }
    
    return null;
  }

  async login(user: any) {
    // 🛡️ SÉCURISATION : On récupère l'ID école depuis l'objet relation OU la propriété directe
    // Cela corrige le bug où schoolId pouvait être undefined même si user.school existait
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

  // 👇 AJOUT : Demande de réinitialisation (envoi email)
  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException("Aucun utilisateur avec cet email.");
    }

    // Token temporaire (15 min) avec un type spécifique 'reset'
    const payload = { sub: user.id, type: 'reset' };
    const token = this.jwtService.sign(payload, { expiresIn: '15m' });

    // Envoi de l'email
    await this.mailService.sendResetPasswordEmail(user.email, token);

    return { message: 'Email de réinitialisation envoyé.' };
  }

  // 👇 AJOUT : Validation et modification du mot de passe
  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      
      if (payload.type !== 'reset') {
        throw new BadRequestException("Token invalide.");
      }

      const userId = payload.sub;
      
      // Mise à jour via le UsersService
      await this.usersService.updatePassword(userId, newPassword);

      return { message: 'Mot de passe modifié avec succès.' };

    } catch (error) {
      throw new BadRequestException("Le lien est invalide ou a expiré.");
    }
  }
}
