import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  // --- CRÉER UNE COMPÉTENCE (Admin uniquement) ---
  @Roles('Admin')
  @Post()
  async create(@Request() req, @Body() body: { name: string; category: string; description?: string }) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("École non identifiée.");

    return this.skillsService.create(body, schoolId);
  }

  // --- LISTER LES COMPÉTENCES (Admin + Profs) ---
  // Les profs en auront besoin pour évaluer les élèves
  @Roles('Admin', 'Enseignant')
  @Get()
  async findAll(@Request() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("École non identifiée.");

    return this.skillsService.findAllBySchool(schoolId);
  }

  // --- ÉVALUER UN ÉLÈVE (Enseignant) ---
  @Roles('Enseignant')
  @Post('evaluate')
  async evaluate(@Request() req, @Body() body: { studentId: number; competenceId: number; level: number; comment?: string }) {
    return this.skillsService.evaluate({
        ...body,
        teacherId: req.user.sub // ID du prof connecté
    });
  }
}
