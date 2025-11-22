import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Homework } from './entities/homework.entity';

@Injectable()
export class HomeworksService {
  constructor(
    @InjectRepository(Homework)
    private homeworksRepository: Repository<Homework>,
  ) {}

  async create(data: any): Promise<Homework> {
    // data contient: title, description, matiere, dueDate, classId
    const homework = this.homeworksRepository.create(data);
    return this.homeworksRepository.save(homework);
  }

  // Trouver les devoirs d'une classe spécifique
  async findByClass(classId: number): Promise<Homework[]> {
    return this.homeworksRepository.find({
      where: { class: { id: classId } },
      order: { dueDate: 'ASC' }, // Les plus urgents en premier
    });
  }
}
