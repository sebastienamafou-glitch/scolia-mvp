// scolia-backend/src/skills/skills.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Competence } from './entities/competence.entity';
import { SkillEvaluation } from './entities/skill-evaluation.entity';
import { CreateSkillDto } from './dto/create-skill.dto'; // ✅ Import DTO

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Competence)
    private competenceRepo: Repository<Competence>,
    @InjectRepository(SkillEvaluation)
    private evaluationRepo: Repository<SkillEvaluation>,
  ) {}

  // ✅ Typage strict
  async create(dto: CreateSkillDto, schoolId: number) {
    const newSkill = this.competenceRepo.create({
      ...dto,
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

  async evaluateBulk(studentId: number, evaluations: { competenceId: number, level: number }[], teacherId: number) {
    const savedEvaluations: SkillEvaluation[] = [];

    for (const ev of evaluations) {
        // 1. Vérif existant (relation student: { id: studentId })
        const existing = await this.evaluationRepo.findOne({
            where: {
                student: { id: studentId },
                competence: { id: ev.competenceId }
            }
        });

        if (existing) {
            existing.level = ev.level;
            existing.teacherId = teacherId;
            savedEvaluations.push(await this.evaluationRepo.save(existing));
        } else {
            // 2. Création (relation student: { id: studentId })
            const newEval = this.evaluationRepo.create({
                student: { id: studentId } as any, // Cast pour éviter erreur type stricte si pas importé
                competence: { id: ev.competenceId },
                teacher: { id: teacherId } as any,
                level: ev.level
            });
            savedEvaluations.push(await this.evaluationRepo.save(newEval));
        }
    }

    return savedEvaluations;
  }
}
