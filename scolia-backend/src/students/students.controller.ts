import { Controller, Get, Param, NotFoundException, UseGuards, Request } from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // ===============================================================
  // 1. ROUTES SPÉCIFIQUES
  // ===============================================================
  
  // --- RÉCUPÉRER MES ENFANTS (Pour le Parent) ---
  @Roles('Parent')
  @Get('my-children')
  async getMyChildren(@Request() req) {
    // L'ID du parent est stocké dans le token JWT (req.user.sub)
    const parentId = req.user.sub; 
    return this.studentsService.findByParent(parentId);
  }

  @Roles('Enseignant', 'Admin')
  @Get('class/:classId') 
  async getStudentsByClass(@Param('classId') classId: string) {
    return this.studentsService.findByClass(Number(classId));
  }

  // ===============================================================
  // 2. ROUTE GÉNÉRIQUE (EN DERNIER)
  // ===============================================================

  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (isNaN(+id)) {
        throw new NotFoundException(`L'ID fourni (${id}) n'est pas un nombre valide.`);
    }

    const student = await this.studentsService.findOne(+id);
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }
}
