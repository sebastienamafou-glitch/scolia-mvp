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

  // 👇 NOUVELLE MÉTHODE AJOUTÉE 👇
  async remove(id: number, schoolId: number): Promise<void> {
    // On utilise delete avec le filtre schoolId pour la sécurité Multi-Tenant
    const result = await this.classesRepository.delete({ 
        id, 
        school: { id: schoolId } 
    });

    // Si aucune ligne n'est affectée, c'est que la classe n'existe pas ou n'est pas dans cette école
    if (result.affected === 0) {
        throw new NotFoundException(`Classe #${id} introuvable ou accès refusé.`);
    }
    // Si la suppression échoue à cause des élèves (FK Constraint), 
    // TypeORM lèvera une erreur que le Controller renverra au Frontend.
  }
}
