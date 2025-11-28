// scolia-backend/src/payments/payments.module.ts

import { Module, forwardRef } from '@nestjs/common'; // 👈 Import forwardRef
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Fee } from './entities/fee.entity';
import { Transaction } from './entities/transaction.entity';
import { UsersModule } from '../users/users.module'; // Import

@Module({
  imports: [
    TypeOrmModule.forFeature([Fee, Transaction]),
    // ✅ CORRECTION : Assurer que Payments attend Users
    forwardRef(() => UsersModule), 
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
