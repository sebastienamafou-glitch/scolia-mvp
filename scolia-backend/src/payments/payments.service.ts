import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fee } from './entities/fee.entity';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Fee)
    private feesRepository: Repository<Fee>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  // 1. Voir le solde (Parent)
  async getFeeByStudent(studentId: number, schoolId: number): Promise<Fee | null> {
    return this.feesRepository.findOne({ 
        where: { studentId, school: { id: schoolId } },
        relations: ['student']
    });
  }

  // 2. Soumettre une référence (Parent)
  async submitTransaction(studentId: number, amount: number, reference: string, schoolId: number): Promise<Transaction> {
    if (!reference || amount <= 0) {
      throw new BadRequestException("Données invalides.");
    }
    
    const newTransaction = this.transactionsRepository.create({
      studentId,
      amount,
      mobileMoneyReference: reference,
      schoolId,
      status: 'Pending',
    });

    return this.transactionsRepository.save(newTransaction);
  }

  // 3. Liste des paiements en attente (Admin)
  async findPending(schoolId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({
        where: { school: { id: schoolId }, status: 'Pending' },
        relations: ['student'],
        order: { transactionDate: 'DESC' }
    });
  }

  // 4. Valider le paiement (Admin)
  async validateTransaction(transactionId: number, schoolId: number, adminId: number): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({ 
        where: { id: transactionId, school: { id: schoolId } },
        relations: ['student']
    });

    if (!transaction) throw new NotFoundException("Transaction introuvable.");
    if (transaction.status !== 'Pending') throw new BadRequestException("Déjà traitée.");

    // Mise à jour du statut transaction
    transaction.status = 'Validated';
    await this.transactionsRepository.save(transaction);

    // Mise à jour du solde élève
    const fee = await this.feesRepository.findOne({ 
        where: { studentId: transaction.studentId, school: { id: schoolId } } 
    });

    if (fee) {
        // On convertit en Number pour éviter les problèmes d'addition de chaînes
        fee.amountPaid = Number(fee.amountPaid) + Number(transaction.amount);
        await this.feesRepository.save(fee);
    }

    return transaction;
  }

  // 5. DÉFINIR LA SCOLARITÉ (Appelé par UsersService lors de la création d'un élève)
  async setStudentTuition(studentId: number, totalAmount: number, schoolId: number): Promise<Fee> {
    let fee = await this.feesRepository.findOne({ 
        where: { studentId, school: { id: schoolId } } 
    });

    if (!fee) {
        // Création si n'existe pas
        fee = this.feesRepository.create({
            studentId,
            school: { id: schoolId },
            totalAmount: totalAmount, // Assurez-vous que l'entité Fee a bien 'totalAmount'
            amountPaid: 0,
        });
    } else {
        // Mise à jour si existe
        fee.totalAmount = totalAmount;
    }

    return this.feesRepository.save(fee);
  }
}
