import { Controller, Get, Post, Body, Param, UseGuards, Request, Logger, ForbiddenException } from '@nestjs/common';
import { GradesService } from './grades.service';
import { BulkGradeDto } from './dto/bulk-grade.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // ✅ Standardisé (guards)
import { RolesGuard } from '../auth/guards/roles.guard';      // ✅ Standardisé (guards)
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  private readonly logger = new Logger(GradesController.name);

  constructor(private readonly gradesService: GradesService) {}

  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  async create(@Request() req, @Body() body: BulkGradeDto) {
    if (!req.user.schoolId && req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException("Contexte école manquant.");
    }
    // Validation basique
    if (!body.notes || !Array.isArray(body.notes)) {
        return { message: "Format invalide. 'notes' doit être un tableau." };
    }
    
    return this.gradesService.saveBulk(body, req.user.schoolId || 0);
  }

  @Roles(UserRole.STUDENT, UserRole.PARENT)
  @Get('my-grades')
  async getMyGrades(@Request() req) {
    const userId = req.user.sub || req.user.id; // Supporte les deux formats de payload
    
    if (req.user.role === UserRole.PARENT) {
        // Pour l'instant, simple message. Le parent doit utiliser /grades/student/:id
        return { message: "Veuillez utiliser la route /grades/student/:id pour voir les notes de vos enfants." };
    }
    return this.gradesService.findByStudentUserId(userId);
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT, UserRole.SUPER_ADMIN)
  @Get('student/:studentId')
  async findByStudent(@Request() req, @Param('studentId') studentId: string) {
    // TODO: Ajouter une vérification que le parent a bien le droit de voir cet élève
    return this.gradesService.findByStudent(Number(studentId));
  }
}
