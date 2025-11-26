import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { User } from '../users/entities/user.entity'; // 👈 IMPORT

@Module({
  imports: [TypeOrmModule.forFeature([User])], // 👈 ON INJECTE USER
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
