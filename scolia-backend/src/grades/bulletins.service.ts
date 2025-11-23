import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { Bulletin } from './entities/bulletin.entity';

@Injectable()
export class BulletinsService {
  constructor(
    @InjectRepository(Grade)
    private gradesRepo: Repository<Grade>,
    @InjectRepository(Bulletin)
    private bulletinRepo: Repository<Bulletin>,
  ) {}

  // 1. Générer les données du bulletin (Calcul des moyennes)
  async getStudentBulletin(studentId: number, period: string) {
    // A. Récupérer l'appréciation existante s'il y en a une
    let bulletin = await this.bulletinRepo.findOne({ where: { studentId, period } });
    if (!bulletin) {
        // On crée un objet vide si pas encore sauvegardé
        bulletin = { appreciation: '', moyenneGenerale: 0, isPublished: false } as Bulletin;
    }

    // B. Récupérer toutes les notes du trimestre
    const grades = await this.gradesRepo.find({
        where: { studentId, period }
    });

    // C. Grouper par matière et calculer les moyennes
    const subjects: Record<string, { totalPoints: number, totalCoef: number, grades: any[] }> = {};

    grades.forEach(grade => {
        if (!subjects[grade.matiere]) {
            subjects[grade.matiere] = { totalPoints: 0, totalCoef: 0, grades: [] };
        }
        // Normaliser sur 20 (si la note est sur 10, on la remet sur 20 pour le calcul)
        const normalizedValue = (grade.value / grade.sur) * 20;
        const coef = grade.coef || 1;

        subjects[grade.matiere].totalPoints += normalizedValue * coef;
        subjects[grade.matiere].totalCoef += coef;
        subjects[grade.matiere].grades.push(grade);
    });

    // D. Formater le résultat final
    const reportDetails = Object.keys(subjects).map(matiere => {
        const data = subjects[matiere];
        const average = data.totalCoef > 0 ? (data.totalPoints / data.totalCoef) : 0;
        return {
            matiere,
            moyenne: parseFloat(average.toFixed(2)), // Arrondi 2 décimales
            coefTotal: data.totalCoef
        };
    });

    // E. Calculer la Moyenne Générale
    const totalMoyennes = reportDetails.reduce((acc, item) => acc + item.moyenne, 0);
    const globalAverage = reportDetails.length > 0 ? (totalMoyennes / reportDetails.length) : 0;

    return {
        studentId,
        period,
        subjects: reportDetails,
        globalAverage: parseFloat(globalAverage.toFixed(2)),
        bulletinData: bulletin // Contient l'appréciation
    };
  }

  // 2. Sauvegarder l'appréciation
  async saveAppreciation(studentId: number, period: string, appreciation: string) {
    let bulletin = await this.bulletinRepo.findOne({ where: { studentId, period } });
    
    if (!bulletin) {
        bulletin = this.bulletinRepo.create({ 
            student: { id: studentId } as any, 
            studentId, // Ajout explicite pour être sûr
            period 
        });
    }

    bulletin.appreciation = appreciation;
    return this.bulletinRepo.save(bulletin);
  }
}
