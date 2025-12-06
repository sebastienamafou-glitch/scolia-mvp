import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../auth/roles.decorator';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notifRepo: Repository<Notification>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // --- MÉTHODE 1 : Notifier une classe ---
  async notifyClass(classId: number, message: string, schoolId: number) {
      // On cherche les parents liés à l'école (Simplification MVP)
      const parents = await this.userRepo.find({ 
          where: { role: UserRole.PARENT, schoolId } 
      });
      
      const notifications = parents.map(parent => {
          return this.notifRepo.create({
              // ✅ CORRECTION: Utiliser la relation 'user' au lieu de 'userId' ou 'userID'
              user: { id: parent.id } as User,
              title: "Message de la classe",
              message: message,
              isRead: false,
              schoolId
          });
      });

      if (notifications.length > 0) {
          await this.notifRepo.save(notifications);
      }
      
      return { sent: true, count: notifications.length };
  }

  // --- MÉTHODES MANQUANTES AJOUTÉES (Pour satisfaire le Contrôleur) ---

  async subscribe(userId: number, token: string) {
      await this.userRepo.update(userId, { fcmToken: token });
      return { success: true };
  }

  async findAllUnread(userId: number) {
      return this.notifRepo.find({
          // ✅ CORRECTION: Utilisation relation 'user'
          where: { user: { id: userId }, isRead: false },
          order: { createdAt: 'DESC' }
      });
  }

  async markAsRead(id: number) {
      await this.notifRepo.update(id, { isRead: true });
      return { success: true };
  }

  async sendTeacherAlert(teacherId: number, message: string) {
      const teacher = await this.userRepo.findOne({ where: { id: teacherId } });
      if (!teacher) throw new NotFoundException("Enseignant introuvable");

      const notif = this.notifRepo.create({
          user: { id: teacherId } as User, // ✅ Relation
          title: "Alerte Vie Scolaire",
          message: message,
          isRead: false,
          schoolId: teacher.schoolId || 0
      });
      
      return this.notifRepo.save(notif);
  }
}
