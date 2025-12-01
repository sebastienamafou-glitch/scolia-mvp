// scolia-backend/src/classes/classes.controller.ts

import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Roles('Admin')
  @Post()
  async create(@Request() req, @Body() body: { name: string; level: string }) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Opération réservée aux administrateurs d'école.");

    // On passe l'ID de l'école pour lier la classe
    return this.classesService.create(body.name, body.level, schoolId);
  }

  // Admin : Gère ses classes
  // Enseignant : Voit les classes pour l'appel/notes
  @Roles('Admin', 'Enseignant')
  @Get()
  async findAll(@Request() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("École non identifiée.");

    // On ne renvoie QUE les classes de CETTE école
    return this.classesService.findAllBySchool(schoolId);
  }
}
