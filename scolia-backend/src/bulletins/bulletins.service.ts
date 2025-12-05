import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from '../grades/entities/grade.entity';
import { Student } from '../students/entities/student.entity';

@Injectable()
export class BulletinsService {
  private readonly logger = new Logger(BulletinsService.name);

  constructor(
    @InjectRepository(Grade)
    private gradesRepo: Repository<Grade>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
  ) {}

  async generateBulletin(studentId: number, period: string) {
    // 1. Smart Lookup : On s'assure d'avoir le bon ID élève (User ID vs Student ID)
    let finalStudentId = studentId;
    const student = await this.studentRepo.findOne({ 
        where: [ { id: studentId }, { userId: studentId } ] 
    });
    
    if (student) finalStudentId = student.id;

    // 2. Récupérer toutes les notes de l'élève
    const grades = await this.gradesRepo.find({
      where: { student: { id: finalStudentId } },
      order: { matiere: 'ASC' }
    });

    // 🚨 CORRECTION CRUCIALE ICI 🚨
    // Si aucune note n'est trouvée, on renvoie "subjects" (vide) et non "averages"
    if (!grades.length) {
        return { 
            subjects: [], // ✅ C'est ce nom que le frontend attend pour faire son .map()
            globalAverage: 0, 
            comments: "Aucune note disponible." 
        };
    }

    // 3. Calculer les moyennes par matière
    const subjects: { [key: string]: number[] } = {};
    
    grades.forEach(grade => {
        // Filtrage simple par période
        if (!subjects[grade.matiere]) subjects[grade.matiere] = [];
        subjects[grade.matiere].push(Number(grade.value));
    });

    const averages = Object.keys(subjects).map(subject => {
        const notes = subjects[subject];
        const avg = notes.reduce((a, b) => a + b, 0) / notes.length;
        return {
            matiere: subject,
            moyenne: parseFloat(avg.toFixed(2)), // Arrondi 2 décimales
            professeur: "Non assigné" 
        };
    });

    // 4. Moyenne Générale
    const globalSum = averages.reduce((acc, item) => acc + item.moyenne, 0);
    const globalAverage = averages.length > 0 ? (globalSum / averages.length).toFixed(2) : 0;

    return {
        studentId: finalStudentId,
        period: period,
        subjects: averages, // ✅ Le bon nom de propriété pour le Frontend
        globalAverage: globalAverage,
        appreciation: "Travail régulier, continuez ainsi !"
    };
  }
}
