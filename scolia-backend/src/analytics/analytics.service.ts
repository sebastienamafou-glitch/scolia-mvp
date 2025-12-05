// scolia-backend/src/analytics/analytics.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Grade } from '../grades/entities/grade.entity';
import { Fee } from '../payments/entities/fee.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Grade) private gradeRepo: Repository<Grade>,
    @InjectRepository(Fee) private feeRepo: Repository<Fee>,
  ) {}

  async getRiskReport(schoolId: number) {
    // 1. Récupérer tous les élèves de l'école avec leurs notes
    const students = await this.studentRepo.find({ 
        where: { class: { school: { id: schoolId } } },
        relations: ['grades', 'class', 'parent'] 
    });

    // 2. OPTIMISATION : Récupérer tous les frais de l'école
    const allFees = await this.feeRepo.find({ where: { school: { id: schoolId } } });
    
    // ✅ CORRECTION ICI : Aggregation des montants
    // On crée une Map qui stocke un OBJET cumulatif { totalAmount, amountPaid }
    const feesMap = new Map<number, { totalAmount: number, amountPaid: number }>();

    allFees.forEach(fee => {
        // Si l'élève existe déjà dans la map, on récupère ses totaux, sinon on initialise à 0
        const currentStats = feesMap.get(fee.studentId) || { totalAmount: 0, amountPaid: 0 };

        // On additionne les nouveaux montants aux anciens
        feesMap.set(fee.studentId, {
            totalAmount: currentStats.totalAmount + Number(fee.totalAmount),
            amountPaid: currentStats.amountPaid + Number(fee.amountPaid)
        });
    });

    const atRiskList: any[] = [];

    for (const student of students) {
      let riskScore = 0;
      const reasons: string[] = [];

      // --- ANALYSE FINANCIÈRE ---
      // On récupère les stats cumulées depuis la Map
      const feeStats = feesMap.get(student.id);
      
      // On ne vérifie que si l'élève a des frais à payer (total > 0)
      if (feeStats && feeStats.totalAmount > 0) { 
          const percentPaid = (feeStats.amountPaid / feeStats.totalAmount) * 100;
          
          // Seuil d'alerte : moins de 30% payé sur la totalité due
          if (percentPaid < 30) {
              riskScore += 1;
              reasons.push(`💸 Retard Paiement (${percentPaid.toFixed(0)}%)`);
          }
      }

      // --- ANALYSE PÉDAGOGIQUE ---
      if (student.grades && student.grades.length > 0) {
          const sum = student.grades.reduce((a, b) => a + Number(b.value), 0);
          const avg = sum / student.grades.length;
          
          if (avg < 10) {
              riskScore += 1;
              reasons.push(`📉 Moyenne faible (${avg.toFixed(1)}/20)`);
          }
      }

      // --- DÉCISION ---
      if (riskScore >= 1) {
          atRiskList.push({
              id: student.id,
              nom: student.nom,
              prenom: student.prenom,
              classe: student.class?.name || 'Sans classe',
              photo: (student as any).photo || '', 
              parentPhone: student.parent?.email, // Utilise l'email à défaut du téléphone
              riskLevel: riskScore >= 2 ? 'HIGH' : 'MEDIUM',
              reasons: reasons
          });
      }
    }

    // Tri par gravité (HIGH d'abord)
    return atRiskList.sort((a, b) => (a.riskLevel === 'HIGH' ? -1 : 1));
  }
}
