// scolia-backend/src/homeworks/homeworks.service.ts

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Homework } from './entities/homework.entity';
import { Class } from '../classes/entities/class.entity';

@Injectable()
export class HomeworksService {
  constructor(
    @InjectRepository(Homework)
    private homeworksRepository: Repository<Homework>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
  ) {}

  async create(data: any, userSchoolId: number): Promise<Homework> {
    const targetClass = await this.classRepository.findOne({ 
        where: { id: data.classId } 
    });

    if (!targetClass) {
        throw new NotFoundException("Classe introuvable.");
    }

    // Vérification Multi-Tenant
    if (targetClass.schoolId !== userSchoolId) {
        throw new ForbiddenException("Vous ne pouvez pas ajouter de devoirs pour une autre école.");
    }

    const newHomework = this.homeworksRepository.create({
      ...data,
      class: targetClass,
      classId: targetClass.id,
      school: { id: userSchoolId } // ✅ On sauvegarde l'école
    });
    
    return this.homeworksRepository.save(newHomework);
  }

  async findByClass(classId: number, userSchoolId: number): Promise<Homework[]> {
    const targetClass = await this.classRepository.findOne({ where: { id: classId } });

    // Si la classe n'existe pas ou n'est pas dans la bonne école, on renvoie vide
    if (!targetClass || targetClass.schoolId !== userSchoolId) {
        return [];
    }

    return this.homeworksRepository.find({
      where: { class: { id: classId } },
      order: { dueDate: 'ASC' },
    });
  }
}
