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

  // --- 1. RECHERCHE PAR CLASSE (Sécurisée & Relationnelle) ---
  // On récupère les Users qui ont le rôle 'Élève' ET qui sont liés à la Class ID et School ID
  async findByClass(classId: number, schoolId: number): Promise<User[]> {
    return this.usersRepository.find({
      where: { 
        role: 'Élève',
        class: { id: classId }, // Utilise la relation SQL
        school: { id: schoolId } // Sécurité Multi-Tenant
      },
      order: { nom: 'ASC' },
      relations: ['class', 'parent'] // ✅ Cela fonctionne maintenant car 'parent' existe dans l'Entity
    });
  }

  // --- 2. RECHERCHE PAR ID ---
  async findOne(id: number): Promise<User | null> {
     return this.usersRepository.findOne({ 
         where: { id, role: 'Élève' }, // On s'assure que c'est bien un élève
         relations: ['class', 'school', 'parent'] 
     });
  }

  // --- 3. RECHERCHE PAR PARENT ---
  async findByParent(parentId: number): Promise<User[]> {
    return this.usersRepository.find({
      where: { 
        // ✅ CORRECTION : Utilisation de la relation pour le filtrage
        parent: { id: parentId }, 
        role: 'Élève' 
      },
      relations: ['class'], // On veut voir la classe de l'enfant
      select: {
          id: true, nom: true, prenom: true, email: true, photo: true, schoolId: true,
          class: { id: true, name: true } // Sélection partielle propre
      }
    });
  }
}
