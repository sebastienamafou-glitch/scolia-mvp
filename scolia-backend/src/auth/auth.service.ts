// scolia-backend/src/auth/auth.service.ts

import { Injectable, BadRequestException, NotFoundException, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; 
import { MailService } from '../mail/mail.service'; 
import { UserRole } from './roles.decorator';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const cleanEmail = email.toLowerCase().trim();
    // On suppose que findOneByEmail charge aussi la relation 'school' si nécessaire
    const user = await this.usersService.findOneByEmail(cleanEmail);
    
    if (!user) {
        this.logger.warn(`Login échoué : Email inconnu (${cleanEmail})`);
        return null;
    }

    if (!user.passwordHash) {
        this.logger.error(`Utilisateur ${cleanEmail} corrompu (pas de hash).`);
        return null;
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    
    if (isMatch) {
      // ✅ Sécurité : On s'assure de ne jamais renvoyer le hash, même par erreur
      // On convertit en objet JS simple pour casser la liaison TypeORM
      const { passwordHash, ...result } = JSON.parse(JSON.stringify(user)); 
      return result;
    } else {
      this.logger.warn(`Login échoué : Mauvais mot de passe pour ${cleanEmail}`);
      return null;
    }
  }

  async login(user: any) {
    if (!user) throw new UnauthorizedException("Identifiants incorrects");

    // Gestion robuste du schoolId
    // Si 'school' est chargé (objet), on prend son ID. Sinon on regarde si une prop 'schoolId' existe.
    const finalSchoolId = user.school?.id || user.schoolId || null;

    if (!Object.values(UserRole).includes(user.role as UserRole)) {
        this.logger.warn(`Rôle inconnu détecté lors du login : ${user.role}`);
    }

    const payload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role, 
        schoolId: finalSchoolId 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id, // Utile pour le front
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        schoolId: finalSchoolId
      }
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
        throw new BadRequestException("Ce token n'est pas valide pour un reset.");
      }

      const userId = payload.sub;

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await this.usersService.updatePassword(userId, hashedPassword);

      return { message: 'Mot de passe modifié avec succès. Vous pouvez vous connecter.' };

    } catch (error) {
        this.logger.error(error);
        throw new BadRequestException("Le lien est invalide ou a expiré.");
    }
  }
}
