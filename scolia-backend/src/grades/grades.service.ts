import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { Student } from '../students/entities/student.entity'; 
import { NotificationsService } from '../notifications/notifications.service'; 
import { BulkGradeDto } from './dto/bulk-grade.dto';

@Injectable()
export class GradesService {
  private readonly logger = new Logger(GradesService.name);

  constructor(
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    @InjectRepository(Student) 
    private studentRepo: Repository<Student>,
    private notifService: NotificationsService,
  ) {}

  async findByStudent(id: number): Promise<Grade[]> {
    return this.gradesRepository.find({
      where: { student: { id } },
      order: { date: 'DESC' },
    });
  }

  async findByStudentUserId(userId: number): Promise<Grade[]> {
      const student = await this.studentRepo.findOne({ where: { userId } });
      if (!student) return [];
      return this.findByStudent(student.id);
  }
  
  async saveBulk(dto: BulkGradeDto, schoolId: number): Promise<Grade[]> {
      const gradesToInsert: Grade[] = [];

      for (const item of dto.notes) {
          const student = await this.studentRepo.findOne({ where: { id: item.studentId } });
          
          if (!student) {
              this.logger.warn(`Tentative de note pour studentId invalide: ${item.studentId}`);
              continue; 
          }

          const grade = this.gradesRepository.create({
              value: item.noteValue,
              student: { id: student.id },
              studentId: student.id, // Explicit
              matiere: dto.matiere,
              sur: dto.noteSur,
              type: dto.titreEvaluation,
              date: new Date(),
              school: { id: schoolId },
              schoolId: schoolId // Explicit
          });
          gradesToInsert.push(grade);
      }
      
      const savedGrades = await this.gradesRepository.save(gradesToInsert);
      
      // Notification (décommenter quand le service sera prêt)
      // this.notifService.notifyNewGrades(savedGrades); 

      return savedGrades;
  }
}
