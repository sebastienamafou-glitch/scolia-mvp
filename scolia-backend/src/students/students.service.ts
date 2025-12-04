// scolia-backend/src/students/students.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // --- 1. RECHERCHE PAR CLASSE ---
  async findByClass(classId: number, schoolId: number): Promise<User[]> {
    return this.usersRepository.find({
      where: { 
        role: 'Élève',
        class: { id: classId },
        school: { id: schoolId }
      },
      order: { nom: 'ASC' },
      relations: ['class', 'parent'] 
    });
  }

  // --- 2. RECHERCHE PAR ID ---
  async findOne(id: number): Promise<User | null> {
     return this.usersRepository.findOne({ 
         where: { id, role: 'Élève' },
         relations: ['class', 'school', 'parent'] 
     });
  }

  // --- 3. RECHERCHE PAR PARENT (CORRIGÉE) ---
  async findByParent(parentId: number): Promise<User[]> {
    return this.usersRepository.find({
      where: { 
        parent: { id: parentId }, 
        role: 'Élève' 
      },
      relations: ['class', 'school'], // ✅ On charge la relation school
      select: {
          id: true, 
          nom: true, 
          prenom: true, 
          email: true, 
          photo: true,
          // schoolId: true,  ❌ SUPPRIMÉ : Causait l'erreur
          school: { id: true }, // ✅ AJOUTÉ : On récupère l'ID via la relation
          class: { id: true, name: true }
      }
    });
  }
}
