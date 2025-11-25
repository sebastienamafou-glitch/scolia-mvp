import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { Student } from '../students/entities/student.entity'; // Import Entité Élève
import { NotificationsService } from '../notifications/notifications.service'; // Import Service Notif

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    @InjectRepository(Student) 
    private studentRepo: Repository<Student>, // Injection du repo Student
    private notifService: NotificationsService, // Injection du service Notif
  ) {}

  async create(data: any): Promise<Grade> {
    // 1. Création de l'objet Note
    const grade = this.gradesRepository.create({
        ...data,
        student: { id: data.studentId }
    });
    
    // 2. Sauvegarde en BDD
    const savedGrade = await this.gradesRepository.save(grade);

    // --- NOTIFICATION PUSH ---
    try {
        // 3. Trouver l'élève et son parent
        const student = await this.studentRepo.findOne({ 
            where: { id: data.studentId }, 
            relations: ['parent'] 
        });

        // 4. Si l'élève a un parent lié, envoyer la notif
        if (student && student.parent) {
            // On utilise les données reçues (data.subject ou data.matiere selon votre DTO)
            const matiere = data.subject || data.matiere || 'Matière inconnue';
            const note = data.value;
            const total = data.total || data.sur || 20;

            await this.notifService.sendPush(
                student.parent.id,
                `Nouvelle Note : ${student.prenom}`,
                `${matiere} : ${note}/${total}`
            );
        }
    } catch (error) {
        console.error("Erreur lors de l'envoi de la notification de note:", error);
        // On ne bloque pas le retour de la note même si la notif échoue
    }
    // -------------------------

    return savedGrade as any;
  }

  async findByStudent(studentId: number): Promise<Grade[]> {
    return this.gradesRepository.find({
      where: { student: { id: studentId } },
      order: { date: 'DESC' },
    });
  }
  
  async saveBulk(notesData: any[]): Promise<Grade[]> {
      const grades = notesData.map(n => this.gradesRepository.create({
          ...n,
          student: { id: n.studentId },
          date: new Date()
      }));
      
      // CORRECTION : On force l'entrée (grades) en 'any' pour éviter l'erreur de typage Array
      const saved = await this.gradesRepository.save(grades as any);
      
      // Optionnel : On pourrait aussi ajouter des notifs ici pour le bulk, 
      // mais attention au spam de notifications pour les parents.
      
      return saved as any;
  }
}
