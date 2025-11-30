import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity'; 
import { Class } from '../classes/entities/class.entity'; 
import { Notification } from './entities/notification.entity'; 

const FCM_LIMIT = 500; // Limite de FCM pour l'envoi de messages groupés
const BATCH_DELAY_MS = 200; // Délai entre l'envoi de gros lots (pour lisser le trafic)

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Class) private classRepo: Repository<Class>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  // --- 1. ABONNEMENT AU SERVICE PUSH ---
  async subscribe(userId: number, token: string): Promise<void> {
    // Stocke le token FCM (Firebase Cloud Messaging) dans la table User
    await this.userRepo.update(userId, { fcmToken: token });
  }

  // --- 2. ENVOI DE MESSAGE PUSH CIBLÉ (Méthode de bas niveau / Simulation) ---
  async sendPush(userId: number, title: string, body: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user && user.fcmToken) {
      console.log(`[FCM PUSH - PROD] -> Envoi à ${user.email}. Message: ${title}`);
      // Ici se trouverait le véritable appel à admin.messaging().send(...)
    }
  }

  // --- 3. ENVOI ET SAUVEGARDE (Méthode unifiée) ---
  async sendAndSave(userId: number, title: string, body: string): Promise<void> {
      // 1. Sauvegarde en BDD (Historique)
      await this.notifRepo.save({
          userId, 
          title,
          message: body,
          isRead: false,
          createdAt: new Date()
      });

      // 2. Envoi du Push (Appelle la méthode existante)
      await this.sendPush(userId, title, body);
  }
  
  // --- 4. GESTION DES NOTIFICATIONS LUES/NON LUES ---

  // Marquer comme lu
  async markAsRead(notificationId: number): Promise<void> {
      await this.notifRepo.update(notificationId, { isRead: true });
  }

  // ✅ NOUVEAU : Récupérer les notifications non lues d'un utilisateur
  async findAllUnread(userId: number) {
      return this.notifRepo.find({ 
          where: { userId, isRead: false },
          order: { createdAt: 'DESC' }
      });
  }
  
  // Fonction utilitaire de délai
  private delay(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // --- 5. GESTION DE L'ALERTE PROFESSEUR (Optimisée pour la diffusion) ---
  async sendTeacherAlert(teacherId: number, schoolId: number, type: string, details: string, duration?: number): Promise<{ message: string; recipients: number }> {
    
    const teacher = await this.userRepo.findOne({ 
        where: { id: teacherId, schoolId, role: 'Enseignant' },
    });

    if (!teacher) {
        throw new NotFoundException('Professeur introuvable.');
    }
    
    // 1. Récupérer tous les destinataires potentiels
    const allParents = await this.userRepo.find({ where: { role: 'Parent', schoolId } });
    const adminUser = await this.userRepo.findOne({ where: { role: 'Admin', schoolId } });
    
    let successfullyNotified = 0;
    const title = `🔔 Alerte École : Absence de M. ${teacher.nom}`;
    const body = `${teacher.prenom} ${teacher.nom} est ${type.toLowerCase()}. Motif: ${details} (Durée estimée: ${duration || 'Non spécifiée'}h).`;
    
    // --- BATCHING ET DIFFUSION AUX PARENTS ---
    
    for (let i = 0; i < allParents.length; i += FCM_LIMIT) {
        const batch = allParents.slice(i, i + FCM_LIMIT);

        // Préparation des notifications pour la sauvegarde BDD en masse (Optimisation)
        const notificationsToSave = batch.map(parent => ({
            userId: parent.id,
            title: title,
            message: body,
            isRead: false
        }));
        
        // Sauvegarde de l'historique pour ce lot
        await this.notifRepo.save(notificationsToSave);

        // SIMULATION DE L'ENVOI DU LOT FCM
        console.log(`[FCM BATCH] Envoi du lot ${Math.floor(i / FCM_LIMIT) + 1} (${batch.length} destinataires)...`);
        
        // Dans le code réel : admin.messaging().sendAll(...)
        
        successfullyNotified += batch.length;
        
        if (i + FCM_LIMIT < allParents.length) {
            await this.delay(BATCH_DELAY_MS); 
        }
    }
    
    // --- NOTIFICATION À L'ADMIN ---
    if (adminUser) {
        // Utilisation de la nouvelle méthode unifiée pour l'admin
        await this.sendAndSave(
            adminUser.id, 
            '🚨 URGENT : ABSENCE PROF', 
            `Le professeur ${teacher.nom} a déclaré une ${type.toLowerCase()}. Détails: ${details}`
        );
        successfullyNotified++;
    }

    return { 
        message: `Alerte diffusée avec succès. ${successfullyNotified} destinataires (Parents et Admin) traités et historisés.`,
        recipients: successfullyNotified 
    };
  }
}
