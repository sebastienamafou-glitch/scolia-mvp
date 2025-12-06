// scolia-backend/src/classes/classes.controller.ts

import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException, Param, ParseIntPipe } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto'; // 👈 Import DTO
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // ✅ Chemin corrigé
import { RolesGuard } from '../auth/guards/roles.guard';      // ✅ Chemin corrigé
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Request() req, @Body() createClassDto: CreateClassDto) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Opération réservée aux administrateurs d'école.");

    return this.classesService.create(createClassDto, schoolId);
  }

  // Admin : Gère ses classes, Enseignant : Voit les classes
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get()
  async findAll(@Request() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("École non identifiée.");

    return this.classesService.findAllBySchool(schoolId);
  }

  // ✅ Route utile pour récupérer une classe spécifique (ex: pour afficher les détails)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
      return this.classesService.findOne(id, req.user.schoolId);
  }
}
