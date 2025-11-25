import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { Competence } from './entities/competence.entity';
import { SkillEvaluation } from './entities/skill-evaluation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Competence, SkillEvaluation])],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
