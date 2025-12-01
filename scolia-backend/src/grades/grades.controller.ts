import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { GradesService } from './grades.service';
import { BulkGradeDto } from './dto/bulk-grade.dto'; // 👈 Import DTO
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Roles('Enseignant', 'Admin')
  @Post()
  async create(@Body() body: BulkGradeDto) { // 👈 Typage strict ici
    // On détecte automatiquement si c'est du bulk grâce au DTO
    if (body.notes && Array.isArray(body.notes)) {
        return this.gradesService.saveBulk(body);
    }
    // Si vous avez une méthode unitaire, vous pouvez la garder, 
    // sinon le bulk couvre tous les cas (même pour 1 note).
    return { message: "Utilisez le format bulk." };
  }

  @Roles('Parent', 'Élève', 'Admin', 'Enseignant')
  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.gradesService.findByStudent(Number(studentId));
  }
}
