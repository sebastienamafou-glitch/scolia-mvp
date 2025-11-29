// scolia-backend/src/classes/classes.service.ts

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

  async create(name: string, level: string, schoolId: number): Promise<Class> {
    const newClass = this.classesRepository.create({ 
        name, 
        level,
        school: { id: schoolId } // ✅ Liaison Multi-Tenant
    });
    return this.classesRepository.save(newClass);
  }

  async findAllBySchool(schoolId: number): Promise<Class[]> {
    return this.classesRepository.find({ 
        where: { school: { id: schoolId } }, // ✅ Filtre de sécurité
        order: { name: 'ASC' } 
    });
  }
  
  // Utile pour les autres modules (ex: vérifier si une classe existe avant d'ajouter un élève)
  async findOne(id: number): Promise<Class | null> {
      return this.classesRepository.findOne({ where: { id } });
  }
}
