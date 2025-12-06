import { Controller, Get, Post, Body, Param, UseGuards, Request, Logger, ForbiddenException } from '@nestjs/common';
import { GradesService } from './grades.service';
import { BulkGradeDto } from './dto/bulk-grade.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// ✅ CORRECTION CHEMIN : guards (pluriel)
import { RolesGuard } from '../auth/guard/roles.guard';
// ✅ CORRECTION : Import Enum
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  private readonly logger = new Logger(GradesController.name);

  constructor(private readonly gradesService: GradesService) {}

  // Seul l'enseignant ou l'admin peut saisir des notes
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  async create(@Request() req, @Body() body: BulkGradeDto) {
    if (!req.user.schoolId && req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException("Contexte école manquant.");
    }

    if (body.notes && Array.isArray(body.notes)) {
        // On passe le schoolId au service pour sécuriser l'enregistrement
        return this.gradesService.saveBulk(body, req.user.schoolId || 0);
    }
    return { message: "Utilisez le format bulk." };
  }

  // Pour l'élève/parent qui consulte SES notes
  @Roles(UserRole.STUDENT, UserRole.PARENT)
  @Get('my-grades')
  async getMyGrades(@Request() req) {
    const userId = req.user.sub;
    // Si c'est un parent, il faut spécifier quel enfant via query param idéalement,
    // mais ici on garde la logique simple : "Mes notes" (pour l'élève connecté)
    if (req.user.role === UserRole.PARENT) {
        // TODO: Implémenter la logique parent qui choisit l'enfant
        return { message: "Veuillez utiliser la route /grades/student/:id" };
    }

    return this.gradesService.findByStudentUserId(userId);
  }

  // Pour Admin/Prof qui consulte un élève spécifique
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT, UserRole.SUPER_ADMIN)
  @Get('student/:studentId')
  async findByStudent(@Request() req, @Param('studentId') studentId: string) {
    // Vérification de sécurité basique
    if (req.user.role === UserRole.PARENT) {
        // Vérifier que cet ID est bien un enfant du parent (à faire dans le service Student idéalement)
    }
    return this.gradesService.findByStudent(Number(studentId));
  }
}
