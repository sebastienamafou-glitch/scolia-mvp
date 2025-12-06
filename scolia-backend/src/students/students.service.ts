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
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // --- 1. RECHERCHE PAR CLASSE ---
  async findByClass(classId: number, schoolId: number): Promise<Student[]> {
    // Si schoolId est 0 (ex: SuperAdmin global), on filtre juste par classe
    const whereCondition: any = { class: { id: classId } };
    if (schoolId > 0) {
        whereCondition.school = { id: schoolId };
    }

    return this.studentsRepository.find({
      where: whereCondition,
      order: { nom: 'ASC' },
      relations: ['class', UserRole.PARENT, 'user'] 
    });
  }

  // --- 2. RECHERCHE PAR ID ---
  async findOne(id: number): Promise<Student | null> {
     return this.studentsRepository.findOne({ 
         where: { id },
         relations: ['class', 'school', UserRole.PARENT, 'user'] 
     });
  }

  // --- 3. RECHERCHE PAR PARENT ---
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
