import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { Student } from '../students/entities/student.entity'; 
import { NotificationsService } from '../notifications/notifications.service'; 
import { BulkGradeDto } from './dto/bulk-grade.dto'; // 👈 Import

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    @InjectRepository(Student) 
    private studentRepo: Repository<Student>,
    private notifService: NotificationsService,
  ) {}

  async findByStudent(studentId: number): Promise<Grade[]> {
    return this.gradesRepository.find({
      where: { student: { id: studentId } },
      order: { date: 'DESC' },
    });
  }
  
  // ✅ Méthode Refactorisée avec Typage Fort
  async saveBulk(dto: BulkGradeDto): Promise<Grade[]> {
      const gradesToInsert = dto.notes.map(item => {
          return this.gradesRepository.create({
              value: item.noteValue,
              student: { id: item.studentId },
              matiere: dto.matiere,
              sur: dto.noteSur,
              type: dto.titreEvaluation,
              date: new Date() // Date de saisie
          });
      });
      
      const savedGrades = await this.gradesRepository.save(gradesToInsert);
      
      // Notification Intelligente (Optionnel : notifier pour tout le groupe ?)
      // Pour l'instant on laisse simple pour éviter le spam
      
      return savedGrades;
  }
}
