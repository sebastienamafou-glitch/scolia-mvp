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
    private studentsRepository: Repository<Student>, // ✅ Changement principal
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // --- 1. RECHERCHE PAR CLASSE ---
  async findByClass(classId: number, schoolId: number): Promise<Student[]> {
    return this.studentsRepository.find({
      where: { 
        class: { id: classId },
        school: { id: schoolId } // Sécurité multi-école
      },
      order: { nom: 'ASC' },
      relations: ['class', 'parent', 'user'] // On charge les relations utiles
    });
  }

  // --- 2. RECHERCHE PAR ID ---
  async findOne(id: number): Promise<Student | null> {
     return this.studentsRepository.findOne({ 
         where: { id },
         relations: ['class', 'school', 'parent', 'user'] 
     });
  }

  // --- 3. RECHERCHE PAR PARENT ---
  // C'est cette fonction qui corrige ton bug frontend
  async findByParent(parentId: number): Promise<Student[]> {
    return this.studentsRepository.find({
      where: { 
        parent: { id: parentId } // On cherche les étudiants liés à ce parent
      },
      relations: ['class', 'school'], // ✅ On charge School et Class
      // Pas besoin de 'select' complexe, TypeORM renvoie tout l'objet Student par défaut
      // ce qui inclut 'dateNaissance' !
      order: { prenom: 'ASC' }
    });
  }
}
