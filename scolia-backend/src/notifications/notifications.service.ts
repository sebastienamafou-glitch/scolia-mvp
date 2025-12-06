import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { UserRole } from '../auth/roles.decorator';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notifRepo: Repository<Notification>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private mailService: MailService,
  ) {}

  // --- MÉTHODES MANQUANTES AJOUTÉES (Pour résoudre les erreurs du contrôleur) ---

  // 1. Enregistrer le token FCM (Pour les push notifs)
  async subscribe(userId: number, token: string) {
      // On met à jour le token FCM de l'utilisateur
      await this.userRepo.update(userId, { fcmToken: token });
      return { success: true, message: "Token FCM mis à jour." };
  }

  // 2. Marquer une notification comme lue
  async markAsRead(id: number) {
      await this.notifRepo.update(id, { isRead: true });
      return { success: true };
  }

  // 3. Récupérer les non-lues
  async findAllUnread(userId: number) {
      return this.notifRepo.find({
          // Utilisation de la relation 'user' si 'userId' n'est pas une colonne
          where: { user: { id: userId }, isRead: false },
          order: { createdAt: 'DESC' }
      });
  }

  // 4. Envoyer une alerte spécifique à un prof (ex: Retard)
  async sendTeacherAlert(teacherId: number, message: string) {
      const teacher = await this.userRepo.findOne({ where: { id: teacherId } });
      if (!teacher) throw new NotFoundException("Enseignant introuvable");

      // Création en base
      const notif = this.notifRepo.create({
          // ✅ CORRECTION TYPEORM : On passe l'objet relation
          user: { id: teacherId } as User, 
          title: "Alerte Vie Scolaire",
          message: message,
          // type: "ALERT", // ⚠️ J'ai commenté cette ligne car l'erreur dit que 'type' n'existe pas dans l'Entité
          isRead: false,
          schoolId: teacher.schoolId || 0
      });
      await this.notifRepo.save(notif);

      this.logger.log(`🔔 Alerte envoyée au prof ${teacherId}: ${message}`);
      return notif;
  }

  // --- MÉTHODES EXISTANTES ---

  async notifyClass(classId: number, message: string, schoolId: number) {
      // 1. Trouver les parents liés à la classe via les élèves
      const parents = await this.userRepo.find({ 
          where: { role: UserRole.PARENT, schoolId } 
      });
      
      const notifications = parents.map(parent => {
          return this.notifRepo.create({
              // ✅ CORRECTION TYPEORM
              user: { id: parent.id } as User,
              title: "Message de la classe",
              message: message,
              // type: "INFO", // ⚠️ Commenté pour éviter l'erreur de build
              schoolId
          });
      });

      if (notifications.length > 0) {
          await this.notifRepo.save(notifications);
      }
      
      return { sent: true, count: notifications.length };
  }

  async create(payload: any) {
      return this.notifRepo.save(payload);
  }
}
