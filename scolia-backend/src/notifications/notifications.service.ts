import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
// ✅ IMPORT AJOUTÉ
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

  async notifyClass(classId: number, message: string, schoolId: number) {
      // 1. Trouver les élèves
      const students = await this.userRepo.find({ where: { classId, schoolId } });

      // 2. Trouver les parents liés
      const parents = await this.userRepo.find({ 
          where: { 
            role: UserRole.PARENT, // ✅ Utilisation Correcte de l'Enum
            schoolId 
          } 
      });
      
      // ... logique d'envoi ...
      return { sent: true };
  }

  async create(payload: any) {
      return this.notifRepo.save(payload);
  }

  async findRecipients(schoolId: number, teacherId: number) {
      const teachers = await this.userRepo.find({
          where: { 
              id: teacherId, 
              schoolId, 
              role: UserRole.TEACHER // ✅ Utilisation Correcte
          },
      });

      const allParents = await this.userRepo.find({ 
          where: { role: UserRole.PARENT, schoolId } // ✅ Utilisation Correcte
      });

      const adminUser = await this.userRepo.findOne({ 
          where: { role: UserRole.ADMIN, schoolId } // ✅ Utilisation Correcte
      });
      
      return { teachers, allParents, adminUser };
  }
}
