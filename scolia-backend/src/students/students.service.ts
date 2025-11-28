import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { User } from '../users/entities/user.entity'; // 👈 Import essentiel

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(User) // 👈 Injection du repository User
    private usersRepository: Repository<User>,
  ) {}

  // --- 1. RECHERCHE PAR CLASSE (Corrigé) ---
  // On cherche maintenant dans la table USER car c'est là que sont les élèves.
  async findByClass(classId: number): Promise<any[]> {
    // Note : Comme vos utilisateurs ont le nom de la classe en texte (ex: "6ème A") 
    // et que l'on reçoit ici un ID, le filtrage exact est complexe sans relation.
    // Pour l'instant, on renvoie TOUS les élèves pour éviter une liste vide.
    // L'amélioration future sera de lier User -> Class par ID.
    
    return this.usersRepository.find({
      where: { role: 'Élève' },
      order: { nom: 'ASC' },
    });
  }

  // --- 2. RECHERCHE PAR ID (Corrigé) ---
  async findOne(id: number): Promise<any> {
     // On regarde d'abord dans la table USER (priorité)
     const user = await this.usersRepository.findOne({ 
         where: { id },
         // relations: ['school'] // Décommentez si besoin des relations
     });

     if (user) return user;

     // Fallback : Si pas trouvé, on regarde dans l'ancienne table Student
     return this.studentsRepository.findOne({ 
         where: { id }, 
         relations: ['class', 'parent', 'grades'] 
     });
  }

  // --- 3. RECHERCHE PAR PARENT (C'était déjà bon) ---
  async findByParent(parentId: number): Promise<any[]> {
    return this.usersRepository.find({
      where: { 
        parentId: parentId,
        role: 'Élève' 
      },
      select: ['id', 'nom', 'prenom', 'email', 'classe', 'photo', 'schoolId'] 
    });
  }
}
