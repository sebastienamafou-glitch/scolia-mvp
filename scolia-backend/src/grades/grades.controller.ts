import { Controller, Get, Post, Body, Param, UseGuards, Request, Logger } from '@nestjs/common';
import { GradesService } from './grades.service';
import { BulkGradeDto } from './dto/bulk-grade.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  private readonly logger = new Logger(GradesController.name);

  constructor(private readonly gradesService: GradesService) {}

  @Roles('Enseignant', 'Admin')
  @Post()
  async create(@Body() body: BulkGradeDto) {
    if (body.notes && Array.isArray(body.notes)) {
        return this.gradesService.saveBulk(body);
    }
    return { message: "Utilisez le format bulk." };
  }

  // ✅ CORRECTION : Ajout de la route 'my-grades' demandée par le client
  @Roles('Élève', 'Parent')
  @Get('my-grades')
  async getMyGrades(@Request() req) {
    this.logger.log(`Récupération des notes pour l'utilisateur ${req.user.sub}`);
    // On suppose que le service a une méthode findByStudent. 
    // Si l'utilisateur est un parent, il faudrait potentiellement passer l'ID de l'enfant.
    return this.gradesService.findByStudent(req.user.sub);
  }

  @Roles('Parent', 'Élève', 'Admin', 'Enseignant')
  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.gradesService.findByStudent(Number(studentId));
  }
}
