import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {
    // Initialisation unique (vérifie si déjà init)
    if (!admin.apps.length) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceAccount = require('../../firebase-admin-key.json'); 
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  // 1. Sauvegarder le token du téléphone
  async saveToken(userId: number, token: string) {
    await this.userRepo.update(userId, { fcmToken: token });
  }

  // 2. Envoyer une notif à un utilisateur précis
  async sendPush(userId: number, title: string, body: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.fcmToken) return;

    try {
      await admin.messaging().send({
        token: user.fcmToken,
        notification: { title, body },
        webpush: {
            notification: {
                icon: '/icon-192x192.png' // Assurez-vous d'avoir une icône
            }
        }
      });
      console.log(`🔔 Notif envoyée à ${user.nom}`);
    } catch (error) {
      console.error("Erreur envoi notif", error);
    }
  }
}
