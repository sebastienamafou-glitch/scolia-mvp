// scolia-backend/src/students/students.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  // --- MÉTHODE AJOUTÉE ---
  // Récupère tous les élèves d'une classe spécifique, triés par nom
  async findByClass(classId: number): Promise<Student[]> {
    return this.studentsRepository.find({
      where: { class: { id: classId } },
      order: { nom: 'ASC' },
    });
  }

  // (Vos autres méthodes existantes...)
  findOne(id: number): Promise<Student | null> {
     return this.studentsRepository.findOne({ 
         where: { id }, 
         relations: ['class', 'parent', 'grades'] 
     });
  }
}
