// scolia-backend/src/mail/mail.service.ts

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    // ⚠️ Configure ici tes vrais accès (Gmail, Outlook, etc.)
    this.transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: 'ton_email@gmail.com', // Remplace ceci
        pass: 'ton_mot_de_passe_app', // Remplace ceci
      },
    });
  }

  async sendResetPasswordEmail(to: string, token: string) {
    // Lien vers le Frontend pour réinitialiser
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    const mailOptions = {
      from: '"Support Scolia" <no-reply@scolia.ci>',
      to: to,
      subject: 'Réinitialisation de votre mot de passe - Scolia',
      html: `
        <h3>Bonjour,</h3>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour en créer un nouveau :</p>
        <a href="${resetLink}">Réinitialiser mon mot de passe</a>
        <p>Ce lien est valide pendant 15 minutes.</p>
      `,
    };

    try {
        await this.transporter.sendMail(mailOptions);
        console.log(`Email envoyé à ${to}`);
    } catch (error) {
        console.error("Erreur envoi email:", error);
    }
  }
}
