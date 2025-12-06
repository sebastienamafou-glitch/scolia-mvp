import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { User } from '../users/entities/user.entity';
// L'import UserRole n'est plus nécessaire ici si on utilise des strings pour les relations

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByClass(classId: number, schoolId: number): Promise<Student[]> {
    const whereCondition: any = { class: { id: classId } };
    if (schoolId > 0) {
        whereCondition.school = { id: schoolId };
    }

    return this.studentsRepository.find({
      where: whereCondition,
      order: { nom: 'ASC' },
      // ✅ CORRIGÉ : Tout en minuscules et strings
      relations: ['class', 'parent', 'user'] 
    });
  }

  async findOne(id: number): Promise<Student | null> {
     return this.studentsRepository.findOne({ 
         where: { id },
         relations: ['class', 'school', 'parent', 'user'] 
     });
  }

  async findByParent(parentId: number): Promise<Student[]> {
    return this.studentsRepository.find({
      where: { 
        parent: { id: parentId } 
      },
      relations: ['class', 'school'], 
      order: { prenom: 'ASC' }
    });
  }
}
