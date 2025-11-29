// scolia-backend/src/payments/payments.service.ts

import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fee } from './entities/fee.entity';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

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
      throw new BadRequestException("Données invalides : montant nul ou référence manquante.");
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
    if (transaction.status !== 'Pending') throw new BadRequestException("Cette transaction a déjà été traitée.");

    // Mise à jour du statut transaction
    transaction.status = 'Validated';
    await this.transactionsRepository.save(transaction);

    // Mise à jour du solde élève
    const fee = await this.feesRepository.findOne({ 
        where: { studentId: transaction.studentId, school: { id: schoolId } } 
    });

    if (fee) {
        const currentPaid = Number(fee.amountPaid);
        const amountToAdd = Number(transaction.amount);
        const totalDue = Number(fee.totalAmount);
        
        let newTotal = currentPaid + amountToAdd;

        // ✅ SÉCURITÉ : Gestion du trop-perçu
        if (newTotal > totalDue) {
            this.logger.warn(`⚠️ Trop-perçu détecté pour l'élève ${transaction.studentId}. Payé: ${newTotal}, Dû: ${totalDue}`);
            // On accepte le paiement (crédit), mais on pourrait aussi rejeter ici selon la politique de l'école.
        }

        fee.amountPaid = newTotal;
        await this.feesRepository.save(fee);
        
        this.logger.log(`✅ Paiement validé par Admin ${adminId}. Élève ${transaction.studentId} : +${amountToAdd}`);
    } else {
        this.logger.warn(`⚠️ Transaction validée mais aucun dossier 'Fee' trouvé pour l'élève ${transaction.studentId}`);
    }

    return transaction;
  }

  // 5. DÉFINIR LA SCOLARITÉ (Appelé par UsersService)
  async setStudentTuition(studentId: number, totalAmount: number, schoolId: number): Promise<Fee> {
    let fee = await this.feesRepository.findOne({ 
        where: { studentId, school: { id: schoolId } } 
    });

    if (!fee) {
        // Création si n'existe pas
        fee = this.feesRepository.create({
            studentId,
            school: { id: schoolId },
            totalAmount: Number(totalAmount),
            amountPaid: 0,
        });
    } else {
        // Mise à jour si existe (ex: changement de scolarité en cours d'année)
        fee.totalAmount = Number(totalAmount);
    }

    return this.feesRepository.save(fee);
  }
}
