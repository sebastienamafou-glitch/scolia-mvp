import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './entities/class.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private classesRepository: Repository<Class>,
  ) {}

  // Créer une classe
  async create(name: string, level: string): Promise<Class> {
    const newClass = this.classesRepository.create({ name, level });
    return this.classesRepository.save(newClass);
  }

  // Lister toutes les classes
  async findAll(): Promise<Class[]> {
    return this.classesRepository.find({
      order: { name: 'ASC' },
    });
  }
  
  // Trouver une classe par ID
  async findOne(id: number): Promise<Class | null> {
    return this.classesRepository.findOneBy({ id });
  }
}
