import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // ✅ CORRIGÉ
import { RolesGuard } from '../auth/guards/roles.guard';      // ✅ CORRIGÉ
import { Roles, UserRole } from '../auth/roles.decorator';

import { CreateSkillDto } from './dto/create-skill.dto';
import { BulkEvaluateDto } from './dto/bulk-evaluate.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Request() req, @Body() dto: CreateSkillDto) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("École non identifiée.");
    return this.skillsService.create(dto, schoolId);
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get()
  async findAll(@Request() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("École non identifiée.");
    return this.skillsService.findAllBySchool(schoolId);
  }

  @Roles(UserRole.TEACHER)
  @Post('evaluate/bulk')
  async evaluateBulk(@Request() req, @Body() dto: BulkEvaluateDto) {
    return this.skillsService.evaluateBulk(
        dto.studentId, 
        dto.evaluations, 
        req.user.sub 
    );
  }
}
