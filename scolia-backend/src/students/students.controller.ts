import { Controller, Get, Param, NotFoundException, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Roles('Parent')
  @Get('my-children')
  async getMyChildren(@Request() req) {
    const parentId = req.user.sub; // ID du parent connecté (User ID)
    
    // Retourne des objets Student (avec dateNaissance)
    return this.studentsService.findByParent(parentId);
  }

  @Roles('Enseignant', 'Admin')
  @Get('class/:classId') 
  async getStudentsByClass(@Request() req, @Param('classId') classId: string) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Accès refusé : École non identifiée.");

    return this.studentsService.findByClass(Number(classId), schoolId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    if (isNaN(+id)) throw new NotFoundException(`ID invalide.`);

    const student = await this.studentsService.findOne(+id);
    if (!student) throw new NotFoundException(`Élève introuvable`);
    
    // Protection Multi-Tenant
    // req.user.schoolId peut être null pour un SuperAdmin, sinon on vérifie
    if (req.user.schoolId && student.schoolId !== req.user.schoolId) {
        throw new ForbiddenException("Cet élève n'appartient pas à votre établissement.");
    }
    
    return student;
  }
}
