import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity'; // 👈 IMPORT CRUCIAL

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(User) // 👈 ON UTILISE USER
    private usersRepository: Repository<User>,
  ) {}

  // Récupérer les élèves d'une classe (Version User)
  async findByClass(classeNom: string): Promise<User[]> { // On change le type de retour
    return this.usersRepository.find({
      where: { 
          role: 'Élève',
          classe: classeNom // Assurez-vous que la colonne s'appelle 'classe' dans User
      },
      order: { nom: 'ASC' },
    });
  }
  
  // Récupérer les enfants d'un parent
  async findByParent(parentId: number): Promise<User[]> {
      return this.usersRepository.find({
          where: {
              role: 'Élève',
              parentId: parentId
          }
      });
  }

  async findOne(id: number): Promise<User | null> {
     return this.usersRepository.findOne({ where: { id } });
  }
}
