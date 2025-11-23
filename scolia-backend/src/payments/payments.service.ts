// scolia-backend/src/payments/payments.service.ts

import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fee } from './entities/fee.entity';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Fee)
    private feesRepository: Repository<Fee>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  // 1. Consulter le solde d'un élève (Pour les parents)
  async getFeeByStudent(studentId: number, schoolId: number): Promise<Fee | null> {
    // CORRECTION : Filtrage par relation school: { id: schoolId }
    return this.feesRepository.findOne({ 
        where: { studentId, school: { id: schoolId } }, 
        relations: ['student'] // Ajouté pour s'assurer que TypeORM résout le filtre
    });
  }

  // 2. Soumettre une référence de transaction (Pour les parents)
  async submitTransaction(
    studentId: number,
    amount: number,
    reference: string,
    schoolId: number
  ): Promise<Transaction> {
    if (!reference || amount <= 0) {
      throw new BadRequestException("Montant ou référence invalide.");
    }
    
    // Créer la nouvelle transaction en attente (ici, l'utilisation de schoolId est acceptable pour l'insertion)
    const newTransaction = this.transactionsRepository.create({
      studentId,
      amount,
      mobileMoneyReference: reference,
      schoolId,
      status: 'Pending',
    });

    return this.transactionsRepository.save(newTransaction);
  }

  // 3. Valider une transaction (Pour les admins)
  async validateTransaction(transactionId: number, schoolId: number, adminId: number): Promise<Fee> {
    // On trouve la transaction en attente pour validation
    const transaction = await this.transactionsRepository.findOne({ 
        // CORRECTION : Filtrage par relation school: { id: schoolId }
        where: { id: transactionId, school: { id: schoolId }, status: 'Pending' }, 
        relations: ['student'] 
    });

    if (!transaction) {
      throw new NotFoundException("Transaction non trouvée ou déjà traitée.");
    }

    // Mettre à jour le statut
    transaction.status = 'Validated';
    await this.transactionsRepository.save(transaction);

    // Mettre à jour la table des frais de l'élève
    let fee = await this.feesRepository.findOne({ 
        // CORRECTION : Filtrage par relation school: { id: schoolId }
        where: { studentId: transaction.studentId, school: { id: schoolId } } 
    });

    if (!fee) {
        // Si les frais n'existent pas, l'admin doit d'abord les créer.
        throw new BadRequestException("Frais dus non définis pour cet élève. L'admin doit les créer d'abord.");
    }

    fee.amountPaid += transaction.amount;
    
    // Retourner la Fee mise à jour pour confirmation
    return this.feesRepository.save(fee);
  }

  // 4. Récupérer toutes les transactions en attente de validation
  async findPending(schoolId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({
        // CORRECTION : Filtrage par relation school: { id: schoolId }
        where: { school: { id: schoolId }, status: 'Pending' },
        relations: ['student'], // Pour afficher le nom de l'élève
        order: { transactionDate: 'ASC' }
    });
  }
}
