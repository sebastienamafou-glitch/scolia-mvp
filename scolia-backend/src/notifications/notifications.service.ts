import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity'; 
import { Class } from '../classes/entities/class.entity'; 

const FCM_LIMIT = 500; // Limite de FCM pour l'envoi de messages groupés
const BATCH_DELAY_MS = 200; // Délai entre l'envoi de gros lots (pour lisser le trafic)

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Class) private classRepo: Repository<Class>,
  ) {}

  // --- 1. ABONNEMENT AU SERVICE PUSH ---
  async subscribe(userId: number, token: string): Promise<void> {
    // Stocke le token FCM (Firebase Cloud Messaging) dans la table User
    await this.userRepo.update(userId, { fcmToken: token });
  }

  // --- 2. ENVOI DE MESSAGE PUSH CIBLÉ (Méthode générique) ---
  // Note: Cette méthode est ici pour la simulation, l'envoi réel par batch est dans sendTeacherAlert
  async sendPush(userId: number, title: string, body: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user && user.fcmToken) {
      console.log(`[FCM PUSH - PROD] -> Envoi à ${user.email}. Message: ${title}`);
    }
  }
  
  // NOUVEAU : Fonction utilitaire de délai
  private delay(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // --- 3. GESTION DE L'ALERTE PROFESSEUR (Optimisée pour la diffusion) ---
  async sendTeacherAlert(teacherId: number, schoolId: number, type: string, details: string, duration?: number): Promise<{ message: string; recipients: number }> {
    
    const teacher = await this.userRepo.findOne({ 
        where: { id: teacherId, schoolId, role: 'Enseignant' },
    });

    if (!teacher) {
        throw new NotFoundException('Professeur introuvable.');
    }
    
    // 1. Récupérer tous les destinataires potentiels (Admin et Parents de l'école)
    // NOTE: Dans une vraie application, on filtrerait uniquement les parents des élèves impactés par les classes du professeur.
    const allParents = await this.userRepo.find({ where: { role: 'Parent', schoolId } });
    const adminUser = await this.userRepo.findOne({ where: { role: 'Admin', schoolId } });
    
    let successfullyNotified = 0;
    
    // --- BATCHING ET DIFFUSION AUX PARENTS ---
    for (let i = 0; i < allParents.length; i += FCM_LIMIT) {
        const batch = allParents.slice(i, i + FCM_LIMIT); // Découpe en lots de 500

        // 💡 Intégration Firebase Admin SDK : Le code réel utiliserait admin.messaging().sendAll(messages)
        const messages = batch.map(parent => ({
            id: parent.id, // Utilisé ici pour la simulation, mais FCM requiert le token
            title: `🔔 Alerte École : Absence de M. ${teacher.nom}`,
            body: `${teacher.prenom} ${teacher.nom} est ${type.toLowerCase()}. Motif: ${details} (Durée estimée: ${duration || 'Non spécifiée'}h).`,
        }));

        // SIMULATION DE L'ENVOI DU LOT
        console.log(`[FCM BATCH] Envoi du lot ${Math.floor(i / FCM_LIMIT) + 1} (${batch.length} destinataires)...`);
        successfullyNotified += batch.length;
        
        // Ajout d'un délai pour lisser les requêtes entre les gros lots, si ce n'est pas le dernier lot
        if (i + FCM_LIMIT < allParents.length) {
            await this.delay(BATCH_DELAY_MS); 
        }
    }
    
    // --- NOTIFICATION À L'ADMIN ---
    if (adminUser) {
        // Envoi simple à l'administrateur
        await this.sendPush(
            adminUser.id, 
            '🚨 URGENT : ABSENCE PROF', 
            `Le professeur ${teacher.nom} a déclaré une ${type.toLowerCase()}. Détails: ${details}`
        );
        successfullyNotified++;
    }

    return { 
        message: `Alerte diffusée avec succès. ${successfullyNotified} destinataires (Parents et Admin) traités.`,
        recipients: successfullyNotified 
    };
  }
}
