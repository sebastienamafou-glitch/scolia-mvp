import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fee } from './entities/fee.entity';
import { Transaction } from './entities/transaction.entity';
import { Student } from '../students/entities/student.entity';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Fee)
    private feesRepository: Repository<Fee>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  // Utilitaire pour trouver le Student ID réel
  private async resolveStudentId(id: number): Promise<number | null> {
      const student = await this.studentRepository.findOne({ 
          where: [ { id: id }, { userId: id } ] 
      });
      return student ? student.id : null;
  }

  @OnEvent('student.created')
  async handleStudentCreation(payload: { studentId: number, schoolId: number, fraisScolarite?: number }) {
      this.logger.log(`🏗️ Création auto du compte paiement pour l'élève #${payload.studentId} (Ecole: ${payload.schoolId})`);
      
      // On passe le schoolId ici
      await this.createPaymentAccount(payload.studentId, payload.schoolId);
      
      if (payload.fraisScolarite) {
          await this.setStudentTuition(payload.studentId, payload.fraisScolarite, null, payload.schoolId);
      }
  }

  async getFeeByStudent(id: number, schoolId: number): Promise<Fee> {
    const realStudentId = await this.resolveStudentId(id);
    
    // Valeur par défaut
    const emptyFee = { 
        totalAmount: 0, 
        amountPaid: 0, 
        studentId: realStudentId || 0,
        schoolId: schoolId 
    } as Fee;

    if (!realStudentId) return emptyFee;

    // Si schoolId est 0 (SuperAdmin), on ne filtre pas par école
    const whereCondition: any = { studentId: realStudentId };
    if (schoolId > 0) whereCondition.school = { id: schoolId };

    const fee = await this.feesRepository.findOne({ 
        where: whereCondition, 
        relations: ['student'] 
    });

    return fee || emptyFee;
  }

  async submitTransaction(userIdOrStudentId: number, amount: number, reference: string, schoolId: number): Promise<Transaction> {
    if (!reference || amount <= 0) throw new BadRequestException("Données invalides.");
    
    const newTransaction = this.transactionsRepository.create({ 
        studentId: userIdOrStudentId, // Ici c'est l'ID de l'utilisateur qui fait l'action ou l'ID student cible
        amount, 
        mobileMoneyReference: reference, 
        schoolId, 
        status: 'Pending' 
    });
    return this.transactionsRepository.save(newTransaction);
  }

  async findPending(schoolId: number): Promise<Transaction[]> {
    const whereCondition: any = { status: 'Pending' };
    if (schoolId > 0) whereCondition.school = { id: schoolId };

    return this.transactionsRepository.find({ 
        where: whereCondition, 
        relations: ['student'], // Attention: relation vers User ici
        order: { transactionDate: 'DESC' } 
    });
  }

  async validateTransaction(transactionId: number, schoolId: number, adminId: number): Promise<Transaction> {
    const whereCondition: any = { id: transactionId };
    if (schoolId > 0) whereCondition.school = { id: schoolId };

    const transaction = await this.transactionsRepository.findOne({ where: whereCondition, relations: ['student'] });
    
    if (!transaction) throw new NotFoundException("Transaction introuvable.");
    if (transaction.status !== 'Pending') throw new BadRequestException("Déjà traitée.");

    // Le studentId dans la transaction peut être un UserID. On résout le vrai StudentID.
    const realStudentId = await this.resolveStudentId(transaction.studentId);
    
    if (!realStudentId) {
        throw new BadRequestException(`Impossible de lier la transaction (User ID: ${transaction.studentId}) à un dossier Étudiant.`);
    }

    transaction.status = 'Validated';
    await this.transactionsRepository.save(transaction);

    // Mise à jour du solde
    let fee = await this.feesRepository.findOne({ where: { studentId: realStudentId } });
    
    // Si le compte fee n'existe pas (cas rare), on le crée
    if (!fee) {
        await this.createPaymentAccount(realStudentId, schoolId);
        fee = await this.feesRepository.findOne({ where: { studentId: realStudentId } });
    }

    if (fee) {
        const newPaid = Number(fee.amountPaid) + Number(transaction.amount);
        fee.amountPaid = newPaid;
        await this.feesRepository.save(fee);
        this.logger.log(`✅ Paiement validé pour élève ${realStudentId} (+${transaction.amount})`);
    }
    return transaction;
  }

  async setStudentTuition(id: number, totalAmount: number, dateLimit: string | null, schoolId: number): Promise<Fee> {
    const realStudentId = await this.resolveStudentId(id);
    if (!realStudentId) throw new NotFoundException("Élève introuvable pour configurer les frais.");

    let fee = await this.feesRepository.findOne({ where: { studentId: realStudentId } });
    
    const safeAmount = isNaN(Number(totalAmount)) ? 0 : Number(totalAmount);

    if (!fee) {
        fee = this.feesRepository.create({ 
            studentId: realStudentId, 
            school: { id: schoolId }, 
            totalAmount: safeAmount, 
            amountPaid: 0,
            dateLimit: dateLimit || undefined 
        });
    } else {
        fee.totalAmount = safeAmount;
        if (dateLimit) fee.dateLimit = dateLimit;
        // On ne change pas l'école d'un fee existant sauf si nécessaire
        if (schoolId && !fee.schoolId) fee.school = { id: schoolId } as any; 
    }
    return this.feesRepository.save(fee);
  }

  // ✅ CORRECTION : Ajout du paramètre schoolId optionnel
  async createPaymentAccount(studentId: number, schoolId?: number) {
      const exists = await this.feesRepository.findOne({ where: { studentId } });
      if (!exists) {
          const newFee = this.feesRepository.create({ 
              studentId, 
              totalAmount: 0, 
              amountPaid: 0,
              school: schoolId ? { id: schoolId } : undefined 
          });
          await this.feesRepository.save(newFee);
      }
  }
}
