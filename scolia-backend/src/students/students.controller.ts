// scolia-backend/src/students/students.controller.ts

import { Controller, Get, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';

// Assurez-vous que les chemins vers vos Guards/Decorators sont corrects
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // --- NOUVELLE ROUTE POUR LES PROFS ---
  // Doit être placée AVANT @Get(':id') pour éviter les conflits de route
  @Roles('Enseignant', 'Admin')
  @Get('class/:classId')
  async getStudentsByClass(@Param('classId') classId: string) {
    return this.studentsService.findByClass(Number(classId));
  }

  // --- ROUTE EXISTANTE ---
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const student = await this.studentsService.findOne(+id);
    
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Pas besoin de filtrer le mot de passe, l'entité Student n'en a pas !
    return student;
  }
}
