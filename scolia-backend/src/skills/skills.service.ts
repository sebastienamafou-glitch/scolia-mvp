// scolia-backend/src/skills/skills.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Competence } from './entities/competence.entity';
import { SkillEvaluation } from './entities/skill-evaluation.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Competence)
    private competenceRepo: Repository<Competence>,
    @InjectRepository(SkillEvaluation)
    private evaluationRepo: Repository<SkillEvaluation>,
  ) {}

  async create(data: any, schoolId: number) {
    const newSkill = this.competenceRepo.create({
      ...data,
      school: { id: schoolId }
    });
    return this.competenceRepo.save(newSkill);
  }

  async findAllBySchool(schoolId: number) {
    return this.competenceRepo.find({
      where: { school: { id: schoolId } },
      order: { category: 'ASC', name: 'ASC' }
    });
  }

  async evaluate(data: any) {
    const evaluation = this.evaluationRepo.create({
        student: { id: data.studentId },
        competence: { id: data.competenceId },
        teacher: { id: data.teacherId },
        level: data.level,
        comment: data.comment
    });
    return this.evaluationRepo.save(evaluation);
  }

  // ✅ MÉTHODE BULK OPTIMISÉE
  async evaluateBulk(studentId: number, evaluations: { competenceId: number, level: number }[], teacherId: number) {
    // 1. Préparation des objets
    const entities = evaluations.map(ev => {
        return this.evaluationRepo.create({
            student: { id: studentId },
            competence: { id: ev.competenceId },
            teacher: { id: teacherId },
            level: ev.level
        });
    });

    // 2. Sauvegarde groupée
    return this.evaluationRepo.save(entities);
  }
}
