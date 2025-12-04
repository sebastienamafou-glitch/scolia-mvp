// scolia-backend/src/grades/grades.service.ts

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
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

  async findByStudent(studentId: number): Promise<Grade[]> {
    // Essayer de trouver via l'ID Student direct, ou via le User ID
    // Note: cette requête suppose que studentId est la clé étrangère dans Grade
    return this.gradesRepository.find({
      where: { student: { id: studentId } },
      order: { date: 'DESC' },
    });
  }
  
  // ✅ Méthode Refactorisée avec "Smart Lookup" pour éviter les crashs FK
  async saveBulk(dto: BulkGradeDto): Promise<Grade[]> {
      const gradesToInsert: Grade[] = [];

      for (const item of dto.notes) {
          // 1. On cherche si l'ID correspond à un Student
          let student = await this.studentRepo.findOne({ where: { id: item.studentId } });

          // 2. Si pas trouvé, on cherche si c'est un User ID (via la relation userId)
          if (!student) {
              student = await this.studentRepo.findOne({ where: { userId: item.studentId } });
          }

          if (!student) {
              this.logger.warn(`⚠️ Note ignorée: Élève introuvable pour ID ${item.studentId}`);
              continue; // On saute cet élève au lieu de faire planter toute la requête
          }

          const grade = this.gradesRepository.create({
              value: item.noteValue,
              student: { id: student.id }, // ✅ On utilise le VRAI ID de la table Student
              matiere: dto.matiere,
              sur: dto.noteSur,
              type: dto.titreEvaluation,
              date: new Date()
          });
          gradesToInsert.push(grade);
      }
      
      if (gradesToInsert.length === 0) {
          throw new NotFoundException("Aucun élève valide trouvé pour l'enregistrement des notes.");
      }

      const savedGrades = await this.gradesRepository.save(gradesToInsert);
      return savedGrades;
  }
}
