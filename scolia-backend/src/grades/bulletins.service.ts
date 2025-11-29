// scolia-backend/src/grades/bulletins.service.ts

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
        // On crée un objet vide (non sauvegardé) si pas encore de bulletin
        bulletin = { appreciation: '', moyenneGenerale: 0, isPublished: false } as Bulletin;
    }

    // B. Récupérer toutes les notes du trimestre
    const grades = await this.gradesRepo.find({
        where: { studentId, period }
    });

    // C. Grouper par matière et calculer les moyennes
    const subjects: Record<string, { totalPoints: number, totalCoef: number, grades: any[] }> = {};

    grades.forEach(grade => {
        // Normalisation du nom de la matière (sécurité optionnelle)
        const matiereKey = grade.matiere.trim();

        if (!subjects[matiereKey]) {
            subjects[matiereKey] = { totalPoints: 0, totalCoef: 0, grades: [] };
        }
        
        // IMPORTANT : On ramène tout sur 20 pour le calcul
        // (Ex: 15/20 reste 15. 4/5 devient 16/20)
        const normalizedValue = (grade.value / grade.sur) * 20;
        const coef = grade.coef || 1;

        subjects[matiereKey].totalPoints += normalizedValue * coef;
        subjects[matiereKey].totalCoef += coef;
        subjects[matiereKey].grades.push(grade);
    });

    // Variables pour le calcul de la Moyenne Générale Pondérée
    let grandTotalPoints = 0;
    let grandTotalCoefs = 0;

    // D. Formater le résultat final par matière
    const reportDetails = Object.keys(subjects).map(matiere => {
        const data = subjects[matiere];
        
        // Moyenne de la matière
        const average = data.totalCoef > 0 ? (data.totalPoints / data.totalCoef) : 0;

        // On ajoute aux grands totaux pour la moyenne générale
        grandTotalPoints += data.totalPoints;
        grandTotalCoefs += data.totalCoef;

        return {
            matiere,
            moyenne: parseFloat(average.toFixed(2)), // Arrondi 2 décimales
            coefTotal: data.totalCoef
        };
    });

    // E. ✅ CALCUL CORRECT DE LA MOYENNE GÉNÉRALE (Pondérée)
    // Au lieu de faire la moyenne des moyennes, on divise le total des points par le total des coefs
    const globalAverage = grandTotalCoefs > 0 ? (grandTotalPoints / grandTotalCoefs) : 0;

    // Optionnel : Mettre à jour la moyenne stockée dans l'entité bulletin si elle a changé
    if (bulletin.id && bulletin.moyenneGenerale !== parseFloat(globalAverage.toFixed(2))) {
       // On pourrait sauvegarder ici automatiquement, ou laisser le prof le faire via 'saveAppreciation'
    }

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
            studentId, 
            period 
        });
    }

    bulletin.appreciation = appreciation;
    
    // On pourrait aussi recalculer et figer la moyenne ici pour l'archivage
    // bulletin.moyenneGenerale = ... (calculé depuis le front ou recalculé ici)

    return this.bulletinRepo.save(bulletin);
  }
}
