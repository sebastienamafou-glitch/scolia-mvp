// scolia-backend/src/classes/classes.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private classesRepository: Repository<Class>,
  ) {}

  async create(createClassDto: CreateClassDto, schoolId: number): Promise<Class> {
    const newClass = this.classesRepository.create({ 
        ...createClassDto,
        school: { id: schoolId } // ✅ Liaison Multi-Tenant
    });
    return this.classesRepository.save(newClass);
  }

  async findAllBySchool(schoolId: number): Promise<Class[]> {
    return this.classesRepository.find({ 
        where: { school: { id: schoolId } }, 
        order: { name: 'ASC' } 
    });
  }
  
  // ✅ SÉCURITÉ : On vérifie que la classe appartient bien à l'école de l'utilisateur
  async findOne(id: number, schoolId: number): Promise<Class> {
      const classe = await this.classesRepository.findOne({ 
          where: { id, school: { id: schoolId } } 
      });
      
      if (!classe) {
          throw new NotFoundException(`Classe #${id} introuvable dans cette école.`);
      }
      return classe;
  }
}
