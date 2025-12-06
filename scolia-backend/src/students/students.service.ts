import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    // @InjectRepository(User) private usersRepository: Repository<User>, // Pas utilisé ici pour l'instant
  ) {}

  async findByClass(classId: number, schoolId: number): Promise<Student[]> {
    const whereCondition: any = { class: { id: classId } };
    if (schoolId > 0) {
        whereCondition.school = { id: schoolId };
    }

    return this.studentsRepository.find({
      where: whereCondition,
      order: { nom: 'ASC' },
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
    // parentId est ici l'ID User du parent
    return this.studentsRepository.find({
      where: { 
        parent: { id: parentId } 
      },
      relations: ['class', 'school'], 
      order: { prenom: 'ASC' }
    });
  }
}
