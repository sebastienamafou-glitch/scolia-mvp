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
    // 1. Récupérer tous les élèves de l'école avec leurs données
    const students = await this.studentRepo.find({ 
        where: { class: { school: { id: schoolId } } },
        relations: ['grades', 'class', 'parent'] 
    });

    // 👇 FIX 1 : Typage explicite de l'array pour éviter l'erreur 'never[]'
    const atRiskList: any[] = [];

    for (const student of students) {
      let riskScore = 0;
      const reasons: string[] = [];

      // --- ANALYSE FINANCIÈRE ---
      const fee = await this.feeRepo.findOne({ where: { studentId: student.id } });
      // Note: Utilise totalAmount (variable locale) pour la logique
      if (fee && fee.totalAmount > 0) { 
          const percentPaid = (Number(fee.amountPaid) / Number(fee.totalAmount)) * 100;
          
          // Si on a payé moins de 30% de la scolarité (seuil d'alerte arbitraire)
          if (percentPaid < 30) {
              riskScore += 1;
              reasons.push('💸 Retard Paiement Critique');
          }
      }

      // --- ANALYSE PÉDAGOGIQUE ---
      if (student.grades && student.grades.length > 0) {
          // Moyenne simple (somme / nombre)
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
              
              // 👇 FIX 2 : On utilise le casting (as any) pour l'accès à 'photo'
              // Le temps que le champ soit ajouté à l'entité Student
              photo: (student as any).photo || '', 
              
              parentPhone: student.parent?.email, 
              riskLevel: riskScore >= 2 ? 'HIGH' : 'MEDIUM',
              reasons: reasons
          });
      }
    }

    // On trie : les cas les plus graves (HIGH) en premier
    return atRiskList.sort((a, b) => (a.riskLevel === 'HIGH' ? -1 : 1));
  }
}
