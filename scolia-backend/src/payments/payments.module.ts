import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Fee } from './entities/fee.entity';
import { Transaction } from './entities/transaction.entity';
import { Student } from '../students/entities/student.entity'; // 👈 1. Importez l'entité Student

@Module({
  imports: [
    // 👇 2. Ajoutez Student dans la liste forFeature
    TypeOrmModule.forFeature([Fee, Transaction, Student]) 
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService], // Exportez si nécessaire
})
export class PaymentsModule {}
