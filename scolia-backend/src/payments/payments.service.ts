// scolia-backend/src/payments/payments.service.ts

import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fee } from './entities/fee.entity';
import { Transaction } from './entities/transaction.entity';
import { School } from '../schools/entities/school.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Fee)
    private feesRepository: Repository<Fee>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  // 1. Consulter le solde d'un élève
  async getFeeByStudent(studentId: number, schoolId: number): Promise<Fee | null> {
    return this.feesRepository.findOne({ 
        where: { studentId: studentId, school: { id: schoolId } },
        relations: ['student']
    });
  }

  // 2. Soumettre une transaction (Parents)
  async submitTransaction(
    studentId: number,
    amount: number,
    reference: string,
    schoolId: number
  ): Promise<Transaction> {
    if (!reference || amount <= 0) {
      throw new BadRequestException("Montant ou référence invalide.");
    }
    
    const newTransaction = this.transactionsRepository.create({
      studentId,
      amount,
      mobileMoneyReference: reference,
      schoolId, // Ici on peut garder schoolId car c'est une création
      status: 'Pending',
    });

    return this.transactionsRepository.save(newTransaction);
  }

  // 3. Valider une transaction (Admin)
  async validateTransaction(transactionId: number, schoolId: number, adminId: number): Promise<Fee> {
    const transaction = await this.transactionsRepository.findOne({ 
        where: { id: transactionId, school: { id: schoolId }, status: 'Pending' },
        relations: ['student'] 
    });

    if (!transaction) {
      throw new NotFoundException("Transaction non trouvée ou déjà traitée.");
    }

    // Mettre à jour le statut
    transaction.status = 'Validated';
    await this.transactionsRepository.save(transaction);

    // Mise à jour des frais
    let fee = await this.feesRepository.findOne({ 
        where: { studentId: transaction.studentId, school: { id: schoolId } } 
    });

    if (!fee) {
        throw new BadRequestException("Frais non définis pour cet élève.");
    }

    fee.amountPaid = Number(fee.amountPaid) + Number(transaction.amount);
    return this.feesRepository.save(fee);
  }

  // 4. LISTE DES TRANSACTIONS EN ATTENTE (C'est ici que ça bloquait)
  async findPending(schoolId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({
        where: { 
            school: { id: schoolId }, // 👈 CORRECTION : Syntaxe relationnelle stricte
            status: 'Pending' 
        },
        relations: ['student'],
        order: { transactionDate: 'ASC' }
    });
  }
}
