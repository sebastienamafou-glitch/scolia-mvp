import { Controller, Get, Param, NotFoundException, UseGuards, Request, ForbiddenException, ParseIntPipe } from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Roles(UserRole.PARENT)
  @Get('my-children')
  async getMyChildren(@Request() req) {
    const parentId = req.user.sub; // ID User du parent
    return this.studentsService.findByParent(parentId);
  }

  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('class/:classId') 
  async getStudentsByClass(@Request() req, @Param('classId', ParseIntPipe) classId: number) { // ✅ ParseIntPipe
    const schoolId = req.user.schoolId;
    
    if (!schoolId && req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException("Accès refusé : École non identifiée.");
    }

    return this.studentsService.findByClass(classId, schoolId || 0);
  }

  // Accès public authentifié (mais filtré par logique métier)
  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) { // ✅ ParseIntPipe
    const student = await this.studentsService.findOne(id);
    if (!student) throw new NotFoundException(`Élève introuvable`);
    
    // 🛡️ Protection Multi-Tenant
    if (req.user.schoolId && student.schoolId !== req.user.schoolId) {
        if (req.user.role !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException("Cet élève n'appartient pas à votre établissement.");
        }
    }
    
    // 🛡️ Protection Parent
    if (req.user.role === UserRole.PARENT) {
        // Le parent doit être lié à l'élève via la relation parent.id (qui est un User ID)
        if (student.parent && student.parent.id !== req.user.sub) {
             throw new ForbiddenException("Accès refusé.");
        }
    }

    return student;
  }
}
