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
  async validateTransaction(transactionId: number, schoolId: number, action: 'validate' | 'reject'): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({ 
        where: { id: transactionId, school: { id: schoolId } },
        relations: ['student']
    });

    if (!transaction) throw new NotFoundException("Transaction introuvable.");
    if (transaction.status !== 'Pending') throw new BadRequestException("Déjà traitée.");

    if (action === 'reject') {
        transaction.status = 'Rejected';
        return this.transactionsRepository.save(transaction);
    }

    // Si validé, on met à jour le solde de l'élève
    transaction.status = 'Validated';
    await this.transactionsRepository.save(transaction);

    const fee = await this.feesRepository.findOne({ 
        where: { studentId: transaction.studentId, school: { id: schoolId } } 
    });

    if (fee) {
        // On convertit en Number pour éviter les concaténations de chaînes
        fee.amountPaid = Number(fee.amountPaid) + Number(transaction.amount);
        await this.feesRepository.save(fee);
    }

    return transaction;
  }

  // 5. DÉFINIR LA SCOLARITÉ (ADMIN)
  async setFee(studentId: number, amountDue: number, dueDate: string, schoolId: number): Promise<Fee> {
    let fee = await this.feesRepository.findOne({ 
        where: { studentId, school: { id: schoolId } } 
    });

    if (!fee) {
        // Création si n'existe pas
        fee = this.feesRepository.create({
            studentId,
            school: { id: schoolId } as any, // Cast as any si TypeORM est strict sur le type partiel
            amountDue,
            amountPaid: 0, // Départ à 0
            dueDate: new Date(dueDate)
        });
    } else {
        // Mise à jour si existe (ex: augmentation ou correction)
        fee.amountDue = amountDue;
        fee.dueDate = new Date(dueDate);
    }

    return this.feesRepository.save(fee);
  }
}
