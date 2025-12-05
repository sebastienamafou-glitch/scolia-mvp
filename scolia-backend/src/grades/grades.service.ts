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

  // ✅ CORRECTION ICI : "Smart Lookup" pour la lecture
  async findByStudent(id: number): Promise<Grade[]> {
    // 1. On essaie de trouver le VRAI Student ID
    // On cherche si 'id' est l'ID de la table Student OU l'ID de la table User (userId)
    const student = await this.studentRepo.findOne({ 
        where: [
            { id: id },       // Cas où le frontend envoie le bon Student ID
            { userId: id }    // Cas où le frontend envoie le User ID
        ] 
    });

    if (!student) {
        this.logger.warn(`Demande de notes pour ID ${id} : Aucun élève trouvé.`);
        return []; // On retourne vide plutôt que de planter
    }

    this.logger.log(`Lecture des notes pour l'élève ${student.prenom} (Student ID: ${student.id})`);

    // 2. On fait la requête avec le bon ID garanti
    return this.gradesRepository.find({
      where: { student: { id: student.id } },
      order: { date: 'DESC' },
    });
  }
  
  // (Le reste du fichier saveBulk reste identique à ce qu'on a fait avant...)
  async saveBulk(dto: BulkGradeDto): Promise<Grade[]> {
      const gradesToInsert: Grade[] = [];

      for (const item of dto.notes) {
          let student = await this.studentRepo.findOne({ where: { id: item.studentId } });
          if (!student) {
              student = await this.studentRepo.findOne({ where: { userId: item.studentId } });
          }

          if (!student) {
              continue; 
          }

          const grade = this.gradesRepository.create({
              value: item.noteValue,
              student: { id: student.id },
              matiere: dto.matiere,
              sur: dto.noteSur,
              type: dto.titreEvaluation,
              date: new Date()
          });
          gradesToInsert.push(grade);
      }
      
      return this.gradesRepository.save(gradesToInsert);
  }
}
