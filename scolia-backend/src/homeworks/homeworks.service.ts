// scolia-backend/src/homeworks/homeworks.service.ts

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Homework } from './entities/homework.entity';
import { Class } from '../classes/entities/class.entity'; // 👈 Import nécessaire

@Injectable()
export class HomeworksService {
  constructor(
    @InjectRepository(Homework)
    private homeworksRepository: Repository<Homework>,
    @InjectRepository(Class) // 👈 Injection pour vérifier l'appartenance
    private classRepository: Repository<Class>,
  ) {}

  // 🔒 SÉCURITÉ : On exige le schoolId pour vérifier les droits
  async create(data: any, userSchoolId: number): Promise<Homework> {
    
    // 1. On vérifie d'abord si la classe existe et à qui elle appartient
    const targetClass = await this.classRepository.findOne({ 
        where: { id: data.classId } 
    });

    if (!targetClass) {
        throw new NotFoundException("Classe introuvable.");
    }

    // 2. ISOLATION MULTI-TENANT
    // Si la classe n'appartient pas à l'école du prof connecté -> REJET
    if (targetClass.schoolId !== userSchoolId) {
        throw new ForbiddenException("Vous ne pouvez pas ajouter de devoirs pour une autre école.");
    }

    // 3. Création sécurisée
    const newHomework = this.homeworksRepository.create({
      ...data,
      class: targetClass, // On lie l'objet classe vérifié
      classId: targetClass.id
    });
    
    const saved = await this.homeworksRepository.save(newHomework);
    return saved as any;
  }

  // 🔒 SÉCURITÉ : Lecture filtrée par école
  async findByClass(classId: number, userSchoolId: number): Promise<Homework[]> {
    // On vérifie que la classe demandée fait bien partie de l'école de l'utilisateur
    const targetClass = await this.classRepository.findOne({ where: { id: classId } });

    if (!targetClass || targetClass.schoolId !== userSchoolId) {
        // On retourne vide (ou erreur) pour ne pas fuiter d'infos
        return [];
    }

    return this.homeworksRepository.find({
      where: { class: { id: classId } },
      order: { dueDate: 'ASC' },
    });
  }
}
