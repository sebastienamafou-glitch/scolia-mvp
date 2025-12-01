// scolia-backend/src/grades/grades.controller.ts

import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { GradesService } from './grades.service';
import { BulkGradeDto } from './dto/bulk-grade.dto'; // 👈 Import DTO
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Roles('Enseignant', 'Admin')
  @Post()
  async create(@Body() body: BulkGradeDto) { // 👈 Typage strict
    // On détecte automatiquement si c'est du bulk grâce au DTO
    if (body.notes && Array.isArray(body.notes)) {
        return this.gradesService.saveBulk(body);
    }
    return { message: "Format invalide. Utilisez le format bulk." };
  }

  @Roles('Parent', 'Élève', 'Admin', 'Enseignant')
  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.gradesService.findByStudent(Number(studentId));
  }
}
