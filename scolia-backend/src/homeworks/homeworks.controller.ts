import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { HomeworksService } from './homeworks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('homeworks')
export class HomeworksController {
  constructor(private readonly homeworksService: HomeworksService) {}

  @Roles('Enseignant')
  @Post()
  async create(@Request() req, @Body() body: any) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("École non identifiée.");

    // ✅ CORRECTION : On passe schoolId en 2ème argument
    return this.homeworksService.create(body, schoolId);
  }

  @Roles('Parent', 'Élève', 'Enseignant')
  @Get('class/:classId')
  async findByClass(@Request() req, @Param('classId') classId: string) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("École non identifiée.");

    // ✅ CORRECTION : On passe schoolId en 2ème argument
    return this.homeworksService.findByClass(Number(classId), schoolId);
  }
}
