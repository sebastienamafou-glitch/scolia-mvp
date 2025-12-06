import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator'; // ✅ Enum

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Roles(UserRole.ADMIN) // ✅ Correction
  @Post()
  async create(@Request() req, @Body() body: { name: string; level: string }) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Opération réservée aux administrateurs d'école.");

    return this.classesService.create(body.name, body.level, schoolId);
  }

  // Admin : Gère ses classes, Enseignant : Voit les classes
  @Roles(UserRole.ADMIN, UserRole.TEACHER) // ✅ Correction
  @Get()
  async findAll(@Request() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("École non identifiée.");

    return this.classesService.findAllBySchool(schoolId);
  }
}
