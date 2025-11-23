import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service'; // <-- Import
import { Student } from './entities/student.entity';
import { UsersModule } from '../users/users.module'; // Gardez-le si nécessaire

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]), 
    UsersModule 
  ],
  controllers: [StudentsController],
  providers: [StudentsService], // <-- C'est la ligne qui répare tout
  exports: [StudentsService],
})
export class StudentsModule {}
