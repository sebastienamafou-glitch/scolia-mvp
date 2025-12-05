// scolia-backend/src/students/students.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity'; // ✅ On utilise l'entité Student
import { User } from '../users/entities/user.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>, // ✅ Changement de Repository
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // --- 1. RECHERCHE PAR CLASSE ---
  async findByClass(classId: number, schoolId: number): Promise<Student[]> {
    return this.studentsRepository.find({
      where: { 
        class: { id: classId },
        school: { id: schoolId } 
      },
      order: { nom: 'ASC' },
      relations: ['class', 'parent', 'user'] 
    });
  }

  // --- 2. RECHERCHE PAR ID ---
  async findOne(id: number): Promise<Student | null> {
     return this.studentsRepository.findOne({ 
         where: { id },
         relations: ['class', 'school', 'parent', 'user'] 
     });
  }

  // --- 3. RECHERCHE PAR PARENT (Celle utilisée par le Dashboard) ---
  async findByParent(parentId: number): Promise<Student[]> {
    // On cherche dans la table STUDENT où le champ 'parent' correspond à l'ID
    return this.studentsRepository.find({
      where: { 
        parent: { id: parentId } 
      },
      relations: ['class', 'school'], // On charge les relations nécessaires
      order: { prenom: 'ASC' }
    });
  }
}
