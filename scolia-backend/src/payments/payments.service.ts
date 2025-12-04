// scolia-backend/src/payments/payments.service.ts

import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fee } from './entities/fee.entity';
import { Transaction } from './entities/transaction.entity';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Fee)
    private feesRepository: Repository<Fee>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  @OnEvent('student.created')
  async handleStudentCreation(payload: { studentId: number, schoolId: number, fraisScolarite?: number }) {
      this.logger.log(`🏗️ Création auto du compte paiement pour l'élève #${payload.studentId}`);
      await this.createPaymentAccount(payload.studentId);
      
      if (payload.fraisScolarite) {
          // On passe null pour la date par défaut lors de la création auto
          await this.setStudentTuition(payload.studentId, payload.fraisScolarite, null, payload.schoolId);
      }
  }

  async getFeeByStudent(studentId: number, schoolId: number): Promise<Fee | null> {
    return this.feesRepository.findOne({ where: { studentId, school: { id: schoolId } }, relations: ['student'] });
  }

  async submitTransaction(studentId: number, amount: number, reference: string, schoolId: number): Promise<Transaction> {
    if (!reference || amount <= 0) throw new BadRequestException("Données invalides.");
    const newTransaction = this.transactionsRepository.create({ studentId, amount, mobileMoneyReference: reference, schoolId, status: 'Pending' });
    return this.transactionsRepository.save(newTransaction);
  }

  async findPending(schoolId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({ where: { school: { id: schoolId }, status: 'Pending' }, relations: ['student'], order: { transactionDate: 'DESC' } });
  }

  async validateTransaction(transactionId: number, schoolId: number, adminId: number): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({ where: { id: transactionId, school: { id: schoolId } }, relations: ['student'] });
    if (!transaction) throw new NotFoundException("Transaction introuvable.");
    if (transaction.status !== 'Pending') throw new BadRequestException("Déjà traitée.");

    transaction.status = 'Validated';
    await this.transactionsRepository.save(transaction);

    let fee = await this.feesRepository.findOne({ where: { studentId: transaction.studentId, school: { id: schoolId } } });
    if (!fee) {
        await this.createPaymentAccount(transaction.studentId);
        fee = await this.feesRepository.findOne({ where: { studentId: transaction.studentId } });
    }

    if (fee) {
        const newPaid = Number(fee.amountPaid) + Number(transaction.amount);
        fee.amountPaid = newPaid;
        await this.feesRepository.save(fee);
        this.logger.log(`✅ Paiement validé pour élève ${transaction.studentId} (+${transaction.amount})`);
    }
    return transaction;
  }

  // 👇 METHODE MISE A JOUR (Accepte la dateLimit)
  async setStudentTuition(studentId: number, totalAmount: number, dateLimit: string | null, schoolId: number): Promise<Fee> {
    let fee = await this.feesRepository.findOne({ where: { studentId } });
    
    // Conversion sécurisée
    const safeAmount = isNaN(Number(totalAmount)) ? 0 : Number(totalAmount);

    if (!fee) {
        fee = this.feesRepository.create({ 
            studentId, 
            school: { id: schoolId }, 
            totalAmount: safeAmount, 
            amountPaid: 0,
            dateLimit: dateLimit || undefined // Transformation null -> undefined pour TypeScript
        });
    } else {
        fee.totalAmount = safeAmount;
        if (dateLimit) fee.dateLimit = dateLimit; // Mise à jour de la date
        if (schoolId) fee.school = { id: schoolId } as any;
    }
    return this.feesRepository.save(fee);
  }

  async createPaymentAccount(studentId: number) {
      const exists = await this.feesRepository.findOne({ where: { studentId } });
      if (!exists) {
          await this.feesRepository.save({ studentId, totalAmount: 0, amountPaid: 0 });
      }
  }
}
