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

    // 2. OPTIMISATION : Récupérer tous les frais de l'école en UNE SEULE requête
    const allFees = await this.feeRepo.find({ where: { school: { id: schoolId } } });
    
    // Création d'un dictionnaire pour un accès instantané (O(1)) par ID élève
    const feesMap = new Map<number, Fee>();
    allFees.forEach(fee => feesMap.set(fee.studentId, fee));

    const atRiskList: any[] = [];

    for (const student of students) {
      let riskScore = 0;
      const reasons: string[] = [];

      // --- ANALYSE FINANCIÈRE (Instantanée grâce à la Map) ---
      const fee = feesMap.get(student.id);
      
      if (fee && Number(fee.totalAmount) > 0) { 
          const paid = Number(fee.amountPaid);
          const total = Number(fee.totalAmount);
          const percentPaid = (paid / total) * 100;
          
          // Seuil d'alerte : moins de 30% payé
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
              parentPhone: student.parent?.email, // Ou tel si dispo
              riskLevel: riskScore >= 2 ? 'HIGH' : 'MEDIUM',
              reasons: reasons
          });
      }
    }

    // Tri par gravité
    return atRiskList.sort((a, b) => (a.riskLevel === 'HIGH' ? -1 : 1));
  }
}
