import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './entities/student.entity';
import { User } from '../users/entities/user.entity'; // 👈 IMPORT AJOUTÉ

@Module({
  // On ajoute User dans la liste pour pouvoir l'utiliser dans le service
  imports: [TypeOrmModule.forFeature([Student, User])], 
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
