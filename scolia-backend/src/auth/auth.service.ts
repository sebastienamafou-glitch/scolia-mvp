// scolia-backend/src/auth/auth.service.ts

import { Injectable, BadRequestException, NotFoundException, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; 
import { MailService } from '../mail/mail.service'; 
import { UserRole } from './roles.decorator'; // 👈 Import de l'Enum créé précédemment

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
    const user = await this.usersService.findOneByEmail(cleanEmail);
    
    if (!user) {
        this.logger.warn(`Login échoué : Email inconnu (${cleanEmail})`);
        return null;
    }

    // Sécurité défensive si la BDD a des utilisateurs mal créés
    if (!user.passwordHash) {
        this.logger.error(`Utilisateur ${cleanEmail} corrompu (pas de hash).`);
        return null;
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    
    if (isMatch) {
      // On retire le mot de passe de l'objet retourné
      const { passwordHash, ...result } = user; 
      return result;
    } else {
      this.logger.warn(`Login échoué : Mauvais mot de passe pour ${cleanEmail}`);
      return null;
    }
  }

  // J'utilise 'any' pour l'instant car l'objet user vient de Passport, 
  // mais idéalement créez une interface UserEntity
  async login(user: any) {
    if (!user) throw new UnauthorizedException("Identifiants incorrects");

    // Gestion robuste du schoolId (cas où l'ORM retourne l'objet School ou juste l'ID)
    const finalSchoolId = user.school?.id || user.schoolId;

    // ⚠️ Vérification critique : Assurons-nous que le rôle est valide
    if (!Object.values(UserRole).includes(user.role as UserRole)) {
        this.logger.warn(`Rôle inconnu détecté lors du login : ${user.role}`);
    }

    const payload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role, // Doit correspondre à l'Enum UserRole
        schoolId: finalSchoolId 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      // Optionnel : renvoyer les infos user pour le frontend (évite de décoder le token tout de suite)
      user: {
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
        schoolId: finalSchoolId
      }
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email.toLowerCase().trim());
    if (!user) {
      // Par sécurité, on peut répondre "Si l'email existe, un lien a été envoyé"
      // pour éviter l'énumération des utilisateurs, mais ici on garde simple.
      throw new NotFoundException("Aucun utilisateur avec cet email.");
    }

    // Token signé spécifiquement pour le reset (ne permet pas de se connecter)
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

      // ✅ CORRECTION MAJEURE : Hachage du nouveau mot de passe ici
      // Sauf si votre usersService.updatePassword le fait déjà, c'est plus sûr de le faire ici.
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
