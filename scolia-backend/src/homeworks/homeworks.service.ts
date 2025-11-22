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
    const newHomework = this.homeworksRepository.create({
      ...data,
      class: { id: data.classId } 
    });
    
    const saved = await this.homeworksRepository.save(newHomework);
    // SOLUTION ULTIME : On utilise 'as any' pour forcer le passage
    return saved as any;
  }

  async findByClass(classId: number): Promise<Homework[]> {
    return this.homeworksRepository.find({
      where: { class: { id: classId } },
      order: { dueDate: 'ASC' },
    });
  }
}
