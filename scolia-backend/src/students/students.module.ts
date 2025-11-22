import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service'; // <-- Import it
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student])], // If service uses Student Repo
  controllers: [StudentsController],
  providers: [StudentsService], // <-- ADD THIS LINE
  exports: [StudentsService],
})
export class StudentsModule {}
