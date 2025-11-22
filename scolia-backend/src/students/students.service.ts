import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  // C'est cette méthode qui manquait !
  findOne(id: number): Promise<Student | null> {
    return this.studentsRepository.findOne({ 
      where: { id },
      relations: ['class', 'parent', 'grades'] // On charge aussi les infos liées
    });
  }

  // Méthodes génériques (pour éviter d'autres erreurs si le contrôleur les appelle)
  create(createStudentDto: any) { return 'This action adds a new student'; }
  findAll() { return this.studentsRepository.find(); }
  update(id: number, updateStudentDto: any) { return `This action updates a #${id} student`; }
  remove(id: number) { return `This action removes a #${id} student`; }
}
