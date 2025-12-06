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

  // Création d'une compétence (Matière/Skill)
  async create(data: any, schoolId: number) {
    const newSkill = this.competenceRepo.create({
      ...data,
      school: { id: schoolId }
    });
    return this.competenceRepo.save(newSkill);
  }

  // Récupérer toutes les compétences d'une école
  async findAllBySchool(schoolId: number) {
    return this.competenceRepo.find({
      where: { school: { id: schoolId } },
      order: { category: 'ASC', name: 'ASC' }
    });
  }

  // ✅ MÉTHODE BULK OPTIMISÉE ET CORRIGÉE
  // Cette méthode gère l'ajout ou la mise à jour (Upsert) des notes
  async evaluateBulk(studentId: number, evaluations: { competenceId: number, level: number }[], teacherId: number) {
    
    // 💡 CORRECTION IMPORTANTE : 
    // On spécifie explicitement le type ": SkillEvaluation[]" pour éviter l'erreur "never" de TypeScript.
    const savedEvaluations: SkillEvaluation[] = [];

    for (const ev of evaluations) {
        // 1. On vérifie si une note existe déjà pour cet élève dans cette compétence
        const existing = await this.evaluationRepo.findOne({
            where: {
                student: { id: studentId },
                competence: { id: ev.competenceId }
            }
        });

        if (existing) {
            // 2. Si elle existe, on met à jour le niveau et l'enseignant
            existing.level = ev.level;
            existing.teacherId = teacherId;
            // .save() retourne l'entité mise à jour, on peut donc l'ajouter au tableau
            savedEvaluations.push(await this.evaluationRepo.save(existing));
        } else {
            // 3. Sinon, on crée une nouvelle évaluation
            const newEval = this.evaluationRepo.create({
                student: { id: studentId },
                competence: { id: ev.competenceId },
                teacher: { id: teacherId },
                level: ev.level
            });
            savedEvaluations.push(await this.evaluationRepo.save(newEval));
        }
    }

    return savedEvaluations;
  }

  // Méthode unitaire (Legacy)
  // Elle réutilise désormais la logique bulk pour éviter la duplication de code
  async evaluate(data: any) {
    const results = await this.evaluateBulk(
        data.studentId, 
        [{ competenceId: data.competenceId, level: data.level }], 
        data.teacherId
    );
    return results[0];
  }
}
