import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import * as path from 'path'; // Nécessaire pour le chemin absolu

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {
    // Initialisation unique de Firebase (vérifie si déjà init)
    if (!admin.apps.length) {
      // CORRECTION RENDER : Utilisation de process.cwd() pour trouver la racine du projet
      // Render place les fichiers secrets à la racine de l'exécution.
      const serviceAccountPath = path.resolve(process.cwd(), 'firebase-admin-key.json');
      
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const serviceAccount = require(serviceAccountPath);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log("✅ Firebase Admin initialisé avec succès.");
        console.log(`   Clé chargée depuis : ${serviceAccountPath}`);
      } catch (error) {
        console.error("⚠️  ERREUR CRITIQUE FIREBASE ⚠️");
        console.error(`   Impossible de charger la clé privée à l'emplacement : ${serviceAccountPath}`);
        console.error("   1. Vérifiez que le fichier 'firebase-admin-key.json' est à la racine en local.");
        console.error("   2. Sur Render, vérifiez 'Secret Files' avec le nom exact 'firebase-admin-key.json'.");
        // On ne throw pas d'erreur ici pour ne pas faire crasher toute l'app, 
        // mais les notifs ne marcheront pas.
      }
    }
  }

  // 1. Sauvegarder le token du téléphone (Appelé quand le parent se connecte)
  async saveToken(userId: number, token: string) {
    await this.userRepo.update(userId, { fcmToken: token });
    console.log(`📲 Token FCM mis à jour pour l'utilisateur ${userId}`);
  }

  // 2. Envoyer une notif à un utilisateur précis
  async sendPush(userId: number, title: string, body: string) {
    // Si Firebase n'a pas pu s'initialiser, on annule
    if (!admin.apps.length) {
        console.warn("⚠️ Tentative d'envoi de push annulée : Firebase non initialisé.");
        return;
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    
    if (!user || !user.fcmToken) {
        console.log(`🔕 Pas de token FCM pour l'utilisateur ${userId} (${user?.nom}).`);
        return;
    }

    try {
      await admin.messaging().send({
        token: user.fcmToken,
        notification: { title, body },
        webpush: {
            notification: {
                icon: '/icon-192x192.png', // Assurez-vous d'avoir une icône dans le dossier public du front
                requireInteraction: true
            }
        }
      });
      console.log(`🔔 Notification envoyée à ${user.nom} : "${title}"`);
    } catch (error) {
      console.error(`❌ Erreur envoi notif à ${user.nom} :`, error.message);
      // Si le token est invalide (ex: app désinstallée), on pourrait le supprimer ici
    }
  }
}
