// scolia-backend/src/users/users.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([User]),
      // 🛡️ ROBUSTESSE : forwardRef gère l'import circulaire avec PaymentsModule
      // (Assurez-vous que PaymentsModule utilise aussi forwardRef de son côté)
      forwardRef(() => PaymentsModule) 
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], 
})
export class UsersModule {}
