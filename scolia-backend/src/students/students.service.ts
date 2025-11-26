// scolia-backend/src/students/students.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { User } from '../users/entities/user.entity'; // 👈 IMPORT AJOUTÉ

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(User) // 👈 INJECTION AJOUTÉE
    private usersRepository: Repository<User>,
  ) {}

  // Récupère tous les élèves d'une classe spécifique (reste basé sur Student pour l'instant)
  async findByClass(classId: number): Promise<Student[]> {
    return this.studentsRepository.find({
      where: { class: { id: classId } },
      order: { nom: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Student | null> {
     return this.studentsRepository.findOne({ 
         where: { id }, 
         relations: ['class', 'parent', 'grades'] 
     });
  }

  // --- CORRECTION MAJEURE ICI ---
  // On cherche dans la table USER (là où sont vos données de création)
  // et non dans la table Student pour l'instant.
  async findByParent(parentId: number): Promise<any[]> {
    const children = await this.usersRepository.find({
      where: { 
        parentId: parentId,
        role: 'Élève' 
      },
      // On sélectionne les champs pertinents pour l'affichage
      select: ['id', 'nom', 'prenom', 'email', 'classe', 'photo', 'schoolId'] 
    });
    
    return children;
  }
}
