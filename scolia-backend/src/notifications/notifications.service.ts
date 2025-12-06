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

  /**
   * Enregistre le token FCM pour les push notifications
   */
  async subscribe(userId: number, token: string) {
    await this.userRepo.update(userId, { fcmToken: token });
    return { success: true, message: "Token FCM mis à jour." };
  }

  /**
   * Marque une notification comme lue
   */
  async markAsRead(id: number) {
    await this.notifRepo.update(id, { isRead: true });
    return { success: true };
  }

  /**
   * Récupère les notifications non lues
   */
  async findAllUnread(userId: number) {
    return this.notifRepo.find({
      where: { userId, isRead: false },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Envoie une alerte à un enseignant
   */
  async sendTeacherAlert(teacherId: number, message: string) {
    const teacher = await this.userRepo.findOne({ where: { id: teacherId } });
    if (!teacher) throw new NotFoundException("Enseignant introuvable");

    // L'erreur rouge ici disparaîtra une fois l'entité corrigée (Étape 1)
    const notif = this.notifRepo.create({
      userId: teacherId,
      title: "Alerte Vie Scolaire",
      message: message,
      isRead: false,
      schoolId: teacher.schoolId
    });

    await this.notifRepo.save(notif);
    this.logger.log(`🔔 Alerte envoyée au prof ${teacherId}: ${message}`);
    return notif;
  }

  /**
   * Notifie tous les parents d'une école (ou classe)
   */
  async notifyClass(classId: number, message: string, schoolId: number) {
    // Simplification : on cible les parents de l'école
    const parents = await this.userRepo.find({ 
      where: { role: UserRole.PARENT, schoolId } 
    });
    
    const notifications = parents.map(parent => {
      return this.notifRepo.create({
        userId: parent.id,
        title: "Message de la classe",
        message: message,
        schoolId,
        isRead: false
      });
    });

    if (notifications.length > 0) {
      await this.notifRepo.save(notifications);
    }
    
    return { sent: true, count: notifications.length };
  }
}
