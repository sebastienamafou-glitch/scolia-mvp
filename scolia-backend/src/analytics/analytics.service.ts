import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Grade } from '../grades/entities/grade.entity';
import { Fee } from '../payments/entities/fee.entity';
// ✅ IMPORT AJOUTÉ
import { UserRole } from '../auth/roles.decorator'; 

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Grade) private gradeRepo: Repository<Grade>,
    @InjectRepository(Fee) private feeRepo: Repository<Fee>,
  ) {}

  async getRiskReport(schoolId: number) {
    const students = await this.studentRepo.find({ 
        where: { class: { school: { id: schoolId } } },
        // ✅ CORRIGÉ : Relations en minuscules strings (pas d'Enum ici)
        relations: ['grades', 'class', 'parent'] 
    });

    const allFees = await this.feeRepo.find({ where: { school: { id: schoolId } } });
    
    const feesMap = new Map<number, { totalAmount: number, amountPaid: number }>();

    allFees.forEach(fee => {
        const currentStats = feesMap.get(fee.studentId) || { totalAmount: 0, amountPaid: 0 };
        feesMap.set(fee.studentId, {
            totalAmount: currentStats.totalAmount + Number(fee.totalAmount),
            amountPaid: currentStats.amountPaid + Number(fee.amountPaid)
        });
    });

    const atRiskList: any[] = [];

    for (const student of students) {
      let riskScore = 0;
      const reasons: string[] = [];

      const feeStats = feesMap.get(student.id);
      
      if (feeStats && feeStats.totalAmount > 0) { 
          const percentPaid = (feeStats.amountPaid / feeStats.totalAmount) * 100;
          if (percentPaid < 30) {
              riskScore += 1;
              reasons.push(`💸 Retard Paiement (${percentPaid.toFixed(0)}%)`);
          }
      }

      if (student.grades && student.grades.length > 0) {
          const sum = student.grades.reduce((a, b) => a + Number(b.value), 0);
          const avg = sum / student.grades.length;
          
          if (avg < 10) {
              riskScore += 1;
              reasons.push(`📉 Moyenne faible (${avg.toFixed(1)}/20)`);
          }
      }

      if (riskScore >= 1) {
          atRiskList.push({
              id: student.id,
              nom: student.nom,
              prenom: student.prenom,
              classe: student.class?.name || 'Sans classe',
              photo: (student as any).photo || '', 
              parentPhone: student.parent?.email, 
              riskLevel: riskScore >= 2 ? 'HIGH' : 'MEDIUM',
              reasons: reasons
          });
      }
    }

    return atRiskList.sort((a, b) => (a.riskLevel === 'HIGH' ? -1 : 1));
  }
}
