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

  @Roles('Élève', 'Parent')
  @Get('my-grades')
  async getMyGrades(@Request() req) {
    this.logger.log(`Récupération des notes pour l'utilisateur ${req.user.sub}`);
    
    // ✅ CORRECTION POUR LE FRONTEND :
    // On ajoute 'date' (ISO format) et 'coefficient' car le frontend essaie de faire .toLocaleString() dessus.
    // Idéalement, remplacez ceci par un appel réel à la BDD : this.gradesService.findByStudent(...)
    
    return [
      { 
        id: 1,
        subject: 'Mathématiques', 
        grade: 15, 
        total: 20,
        coefficient: 2,
        date: new Date().toISOString(), // Empêche le crash "toLocaleString undefined"
        comment: 'Bon travail'
      },
      { 
        id: 2,
        subject: 'Histoire-Géo', 
        grade: 12.5, 
        total: 20,
        coefficient: 1,
        date: new Date(Date.now() - 86400000).toISOString(), // Hier
        comment: 'Peut mieux faire'
      },
      { 
        id: 3,
        subject: 'Anglais', 
        grade: 18, 
        total: 20,
        coefficient: 1,
        date: new Date(Date.now() - 172800000).toISOString(), // Avant-hier
        comment: 'Excellent'
      }
    ];
  }

  @Roles('Parent', 'Élève', 'Admin', 'Enseignant')
  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.gradesService.findByStudent(Number(studentId));
  }
}
