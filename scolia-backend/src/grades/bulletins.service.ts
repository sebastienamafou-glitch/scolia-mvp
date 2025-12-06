// scolia-backend/src/grades/bulletins.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity'; // Assure-toi que ce fichier existe bien dans src/grades/entities/
import { Student } from '../students/entities/student.entity';
import { Bulletin } from './entities/bulletin.entity';

@Injectable()
export class BulletinsService {
  constructor(
    @InjectRepository(Grade) private gradesRepo: Repository<Grade>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Bulletin) private bulletinRepo: Repository<Bulletin>,
  ) {}

  async generateBulletin(studentId: number, period: string, schoolId: number) {
    // 1. Récupérer l'élève (Filtrage sécurisé)
    const student = await this.studentRepo.findOne({ 
        where: [ 
            { id: studentId, school: { id: schoolId } }, // Option 1 : ID direct
            { userId: studentId, school: { id: schoolId } } // Option 2 : ID User
        ] 
    });
    
    const finalStudentId = student ? student.id : studentId;

    // 2. Récupérer le bulletin existant (Appréciation)
    let bulletinData = await this.bulletinRepo.findOne({
        where: { 
            studentId: finalStudentId, 
            period: period,
            school: { id: schoolId } 
        }
    });

    // 3. Récupérer les notes (Correction syntaxe TypeORM)
    const grades = await this.gradesRepo.find({
      where: { 
          student: { id: finalStudentId }, 
          school: { id: schoolId } 
      },
      order: { matiere: 'ASC' } // Le tri se fait sur la colonne 'matiere'
    });

    if (!grades.length) {
        return { 
            subjects: [], 
            globalAverage: 0, 
            bulletinData: bulletinData || { appreciation: '' },
            isBlocked: false 
        };
    }

    // 4. Calculs
    const subjectsData: Record<string, { points: number; coefs: number }> = {};
    
    for (const grade of grades) {
        // On accède aux propriétés de l'entité Grade
        // Si TypeScript râle ici, c'est que l'entité Grade n'a pas @Column() matiere
        const matiere = grade.matiere; 
        
        if (!subjectsData[matiere]) {
            subjectsData[matiere] = { points: 0, coefs: 0 };
        }
        
        const val = Number(grade.value);
        const sur = Number(grade.sur || 20); // Valeur par défaut 20 si null
        const coef = Number(grade.coef || 1);
        const noteSur20 = (val / sur) * 20;

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
          where: { studentId, period, school: { id: schoolId } }
      });

      if (!bulletin) {
          bulletin = this.bulletinRepo.create({
              studentId,
              period,
              school: { id: schoolId },
              appreciation
          });
      } else {
          bulletin.appreciation = appreciation;
      }

      return this.bulletinRepo.save(bulletin);
  }
}
