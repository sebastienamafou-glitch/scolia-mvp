// scolia-backend/src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Student } from '../students/entities/student.entity'; // 👈 Import Student
import { PaymentsModule } from '../payments/payments.module';

@Module({
  // 👇 AJOUTER Student ICI
  imports: [
    TypeOrmModule.forFeature([User, Student]), 
    PaymentsModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
