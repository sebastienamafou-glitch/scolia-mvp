import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from '../grades/entities/grade.entity';
import { Student } from '../students/entities/student.entity';
import { Bulletin } from '../grades/entities/bulletin.entity';

@Injectable()
export class BulletinsService {
  constructor(
    @InjectRepository(Grade) private gradesRepo: Repository<Grade>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Bulletin) private bulletinRepo: Repository<Bulletin>,
  ) {}

  async generateBulletin(studentId: number, period: string, schoolId: number) {
    // 1. Récupérer l'élève
    const student = await this.studentRepo.findOne({ 
        where: [ 
            { id: studentId, school: { id: schoolId } }, 
            { userId: studentId, school: { id: schoolId } } 
        ] 
    });
    
    const finalStudentId = student ? student.id : studentId;

    // 2. Récupérer le bulletin existant
    let bulletinData = await this.bulletinRepo.findOne({
        where: { 
            student: { id: finalStudentId }, // ✅ Relation
            period: period,
            school: { id: schoolId } // ✅ Relation
        }
    });

    // 3. Récupérer les notes
    const grades = await this.gradesRepo.find({
      where: { 
          student: { id: finalStudentId }, 
          school: { id: schoolId } 
      },
      order: { matiere: 'ASC' }
    });

    if (!grades.length) {
        return { 
            subjects: [], 
            globalAverage: 0, 
            bulletinData: bulletinData || { appreciation: '' },
            isBlocked: false 
        };
    }

    // 4. Calculs (Code simplifié pour éviter les erreurs de typage sur 'matiere' et 'sur')
    // On suppose ici que ton entité Grade a bien les champs 'matiere', 'value', 'sur', 'coef'
    const subjectsData: Record<string, { points: number; coefs: number }> = {};
    
    for (const grade of grades) {
        // Cast explicite si TypeScript ne voit pas les colonnes (temporaire)
        const g = grade as any; 
        const matiere = g.matiere || 'Matière inconnue';
        
        if (!subjectsData[matiere]) {
            subjectsData[matiere] = { points: 0, coefs: 0 };
        }
        
        const val = Number(g.value);
        const sur = Number(g.sur || 20);
        const coef = Number(g.coef || 1);
        const noteSur20 = sur > 0 ? (val / sur) * 20 : 0;

        subjectsData[matiere].points += noteSur20 * coef;
        subjectsData[matiere].coefs += coef;
    }

    let totalPointsGeneral = 0;
    let totalCoefsGeneral = 0;

    const subjects = Object.keys(subjectsData).map(matiere => {
        const data = subjectsData[matiere];
        const avg = data.coefs > 0 ? (data.points / data.coefs) : 0;
        
        totalPointsGeneral += data.points;
        totalCoefsGeneral += data.coefs;

        return {
            matiere,
            moyenne: parseFloat(avg.toFixed(2)),
            coefTotal: data.coefs
        };
    });

    const globalAverage = totalCoefsGeneral > 0 
        ? (totalPointsGeneral / totalCoefsGeneral).toFixed(2) 
        : "0.00";

    return {
        studentId: finalStudentId,
        period: period,
        subjects,
        globalAverage,
        bulletinData: bulletinData || { appreciation: '' }
    };
  }

  async saveAppreciation(studentId: number, period: string, appreciation: string, schoolId: number) {
      let bulletin = await this.bulletinRepo.findOne({
          where: { student: { id: studentId }, period, school: { id: schoolId } }
      });

      if (!bulletin) {
          bulletin = this.bulletinRepo.create({
              student: { id: studentId } as any,
              period,
              school: { id: schoolId } as any,
              appreciation
          });
      } else {
          bulletin.appreciation = appreciation;
      }

      return this.bulletinRepo.save(bulletin);
  }
}
