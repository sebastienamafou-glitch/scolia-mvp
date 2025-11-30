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

  // 1. Voir le solde (Parent / Admin)
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

        // Gestion du trop-perçu (Log seulement, on ne bloque pas l'encaissement)
        if (newTotal > totalDue) {
            this.logger.warn(`⚠️ Trop-perçu détecté pour l'élève ${transaction.studentId}. Payé: ${newTotal}, Dû: ${totalDue}`);
        }

        fee.amountPaid = newTotal;
        await this.feesRepository.save(fee);
        
        this.logger.log(`✅ Paiement validé par Admin ${adminId}. Élève ${transaction.studentId} : +${amountToAdd}`);
    } else {
        // Si le dossier 'Fee' n'existe pas encore, on le crée à la volée
        await this.createPaymentAccount(transaction.studentId);
        // Et on rappelle récursivement pour appliquer le paiement (cas rare)
        return this.validateTransaction(transactionId, schoolId, adminId);
    }

    return transaction;
  }

  // 5. DÉFINIR LA SCOLARITÉ (Admin)
  async setStudentTuition(studentId: number, totalAmount: number, schoolId: number): Promise<Fee> {
    let fee = await this.feesRepository.findOne({ 
        where: { studentId } // On cherche par élève (schoolId implicite car un élève n'a qu'une école)
    });

    if (!fee) {
        fee = this.feesRepository.create({
            studentId,
            school: { id: schoolId },
            totalAmount: Number(totalAmount),
            amountPaid: 0,
        });
    } else {
        fee.totalAmount = Number(totalAmount);
        // Si l'école change, on met à jour
        if (schoolId) fee.school = { id: schoolId } as any;
    }

    return this.feesRepository.save(fee);
  }

  // ✅ 6. CRÉATION AUTOMATIQUE DU COMPTE (La méthode manquante)
  // Appelée lors de l'inscription d'un élève pour éviter les erreurs "null"
  async createPaymentAccount(userId: number) {
      const exists = await this.feesRepository.findOne({ where: { studentId: userId } });
      if (!exists) {
          await this.feesRepository.save({
              studentId: userId,
              totalAmount: 0,
              amountPaid: 0,
              // Le schoolId sera attaché plus tard ou déduit de l'utilisateur
          });
      }
  }
}
