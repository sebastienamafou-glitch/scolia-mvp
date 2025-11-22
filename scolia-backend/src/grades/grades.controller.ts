import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { GradesService } from './grades.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Roles('Enseignant', 'Admin')
  @Post()
  create(@Body() body: any) {
    // Gestion simple ou en masse
    if (Array.isArray(body.notes)) {
        const notesToSave = body.notes.map((n: any) => ({
            studentId: n.studentId,
            value: n.noteValue,
            matiere: body.matiere,
            sur: body.noteSur,
            type: body.titreEvaluation
        }));
        return this.gradesService.saveBulk(notesToSave);
    }
    return this.gradesService.create(body);
  }

  @Roles('Parent', 'Élève', 'Admin', 'Enseignant')
  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.gradesService.findByStudent(Number(studentId));
  }
}
