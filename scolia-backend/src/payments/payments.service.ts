// scolia-backend/src/payments/payments.service.ts

import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fee } from './entities/fee.entity';
import { Transaction } from './entities/transaction.entity';
import { Student } from '../students/entities/student.entity'; // ✅ Import nécessaire
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
    private studentRepository: Repository<Student>, // ✅ Injection pour la résolution d'ID
  ) {}

  // Utilitaire pour trouver le Student ID réel à partir d'un ID (qui peut être User ou Student)
  private async resolveStudentId(id: number): Promise<number | null> {
      const student = await this.studentRepository.findOne({ 
          where: [ { id: id }, { userId: id } ] // Cherche par ID ou par UserID
      });
      return student ? student.id : null;
  }

  @OnEvent('student.created')
  async handleStudentCreation(payload: { studentId: number, schoolId: number, fraisScolarite?: number }) {
      this.logger.log(`🏗️ Création auto du compte paiement pour l'élève #${payload.studentId}`);
      // Ici payload.studentId est supposé être le bon (provenant de la création Student)
      await this.createPaymentAccount(payload.studentId);
      
      if (payload.fraisScolarite) {
          await this.setStudentTuition(payload.studentId, payload.fraisScolarite, null, payload.schoolId);
      }
  }

  async getFeeByStudent(id: number, schoolId: number): Promise<Fee | null> {
    const realStudentId = await this.resolveStudentId(id);
    if (!realStudentId) return null;
    return this.feesRepository.findOne({ where: { studentId: realStudentId, school: { id: schoolId } }, relations: ['student'] });
  }

  async submitTransaction(userIdOrStudentId: number, amount: number, reference: string, schoolId: number): Promise<Transaction> {
    if (!reference || amount <= 0) throw new BadRequestException("Données invalides.");
    
    // Note: Transaction lie à User (studentId dans TransactionEntity est souvent l'User ID)
    // On garde l'ID tel quel pour la transaction si l'entité Transaction pointe vers User
    const newTransaction = this.transactionsRepository.create({ 
        studentId: userIdOrStudentId, // Ici on stocke l'ID reçu (souvent User ID)
        amount, 
        mobileMoneyReference: reference, 
        schoolId, 
        status: 'Pending' 
    });
    return this.transactionsRepository.save(newTransaction);
  }

  async findPending(schoolId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({ where: { school: { id: schoolId }, status: 'Pending' }, relations: ['student'], order: { transactionDate: 'DESC' } });
  }

  async validateTransaction(transactionId: number, schoolId: number, adminId: number): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({ where: { id: transactionId, school: { id: schoolId } }, relations: ['student'] });
    if (!transaction) throw new NotFoundException("Transaction introuvable.");
    if (transaction.status !== 'Pending') throw new BadRequestException("Déjà traitée.");

    // ✅ RÉSOLUTION DE L'ID POUR LA TABLE FEE
    // La transaction contient souvent un User ID, mais Fee requiert un Student ID
    const realStudentId = await this.resolveStudentId(transaction.studentId);
    
    if (!realStudentId) {
        throw new BadRequestException(`Impossible de lier la transaction (User ID: ${transaction.studentId}) à un dossier Étudiant.`);
    }

    transaction.status = 'Validated';
    await this.transactionsRepository.save(transaction);

    let fee = await this.feesRepository.findOne({ where: { studentId: realStudentId, school: { id: schoolId } } });
    
    if (!fee) {
        await this.createPaymentAccount(realStudentId);
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
        // Correction du cast 'any'
        if (schoolId) fee.school = { id: schoolId } as any; 
    }
    return this.feesRepository.save(fee);
  }

  async createPaymentAccount(studentId: number) {
      // On suppose ici que studentId est déjà un ID valide de la table Student
      const exists = await this.feesRepository.findOne({ where: { studentId } });
      if (!exists) {
          // Création sécurisée avec ID école par défaut null (sera mis à jour plus tard)
          await this.feesRepository.save({ studentId, totalAmount: 0, amountPaid: 0 });
      }
  }
}
