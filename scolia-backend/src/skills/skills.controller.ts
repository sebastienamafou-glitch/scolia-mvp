// scolia-backend/src/skills/skills.controller.ts

import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Roles('Admin')
  @Post()
  async create(@Request() req, @Body() body: { name: string; category: string; description?: string }) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("École non identifiée.");
    return this.skillsService.create(body, schoolId);
  }

  @Roles('Admin', 'Enseignant')
  @Get()
  async findAll(@Request() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("École non identifiée.");
    return this.skillsService.findAllBySchool(schoolId);
  }

  // Route unitaire (Legacy)
  @Roles('Enseignant')
  @Post('evaluate')
  async evaluate(@Request() req, @Body() body: any) {
    return this.skillsService.evaluate({ ...body, teacherId: req.user.sub });
  }

  // ✅ NOUVELLE ROUTE BULK (Indispensable pour le frontend)
  @Roles('Enseignant')
  @Post('evaluate/bulk')
  async evaluateBulk(@Request() req, @Body() body: { studentId: number, evaluations: { competenceId: number, level: number }[] }) {
    return this.skillsService.evaluateBulk(
        body.studentId, 
        body.evaluations, 
        req.user.sub // ID du prof
    );
  }
}
