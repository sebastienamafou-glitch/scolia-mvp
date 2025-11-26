import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Competence } from './entities/competence.entity';
// 👇 Import ajouté
import { SkillEvaluation } from './entities/skill-evaluation.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Competence)
    private competenceRepo: Repository<Competence>,
    // 👇 Injection ajoutée
    @InjectRepository(SkillEvaluation)
    private evaluationRepo: Repository<SkillEvaluation>,
  ) {}

  // 1. Créer une compétence (Admin)
  async create(data: { name: string; category: string; description?: string }, schoolId: number) {
    const newSkill = this.competenceRepo.create({
      ...data,
      school: { id: schoolId } // Liaison Multi-Tenant
    });
    return this.competenceRepo.save(newSkill);
  }

  // 2. Lister les compétences de l'école
  async findAllBySchool(schoolId: number) {
    return this.competenceRepo.find({
      where: { school: { id: schoolId } },
      order: { category: 'ASC', name: 'ASC' }
    });
  }

  // 3. Enregistrer une évaluation (Méthode ajoutée)
  async evaluate(data: { studentId: number; competenceId: number; level: number; comment?: string; teacherId: number }) {
    const evaluation = this.evaluationRepo.create({
        student: { id: data.studentId },
        competence: { id: data.competenceId },
        teacher: { id: data.teacherId },
        level: data.level,
        comment: data.comment
    });
    return this.evaluationRepo.save(evaluation);
  }
}
