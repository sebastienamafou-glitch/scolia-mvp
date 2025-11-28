// scolia-backend/src/users/users.module.ts

import { Module, forwardRef } from '@nestjs/common'; // 👈 Import forwardRef
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { PaymentsModule } from '../payments/payments.module'; // 👈 Import

@Module({
  imports: [
      TypeOrmModule.forFeature([User]),
      // ✅ CORRECTION : Assurer que la dépendance Payments est gérée de ce côté
      forwardRef(() => PaymentsModule) 
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], 
})
export class UsersModule {}
