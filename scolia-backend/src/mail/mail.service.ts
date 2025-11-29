// scolia-backend/src/mail/mail.service.ts

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: any;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: this.configService.get<number>('MAIL_PORT') === 465, // True pour 465, False pour les autres
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendResetPasswordEmail(to: string, token: string) {
    // On récupère l'URL frontend depuis le .env (ou localhost par défaut)
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    const fromSender = this.configService.get<string>('MAIL_FROM') || '"Scolia" <no-reply@scolia.ci>';

    const mailOptions = {
      from: fromSender,
      to: to,
      subject: 'Réinitialisation de mot de passe - Scolia',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #0A2240;">Bonjour,</h2>
            <p>Une demande de réinitialisation de mot de passe a été effectuée pour votre compte <strong>${to}</strong>.</p>
            <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
            <a href="${resetLink}" style="background-color: #F77F00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser mon mot de passe</a>
            <p style="margin-top: 20px; font-size: 0.9em; color: #666;">Ce lien est valide pendant 15 minutes.</p>
        </div>
      `,
    };

    try {
        await this.transporter.sendMail(mailOptions);
        console.log(`📧 Email envoyé à ${to}`);
    } catch (error) {
        console.error("❌ Erreur envoi email:", error);
    }
  }
}
