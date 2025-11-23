// scolia-backend/src/students/students.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';

@Module({
  imports: [
    // 1. On charge l'entité Student pour que le Service puisse faire des requêtes
    TypeOrmModule.forFeature([Student]) 
  ],
  controllers: [StudentsController],
  // 2. CRITIQUE : On doit fournir le Service au module
  providers: [StudentsService], 
  // 3. On l'exporte si d'autres modules en ont besoin
  exports: [StudentsService], 
})
export class StudentsModule {}
