import { Controller, Get, Param, NotFoundException, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// ✅ CORRECTION CHEMIN : 'guards' au pluriel
import { RolesGuard } from '../auth/guard/roles.guard';
// ✅ CORRECTION : Import de l'Enum
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // ✅ CORRECTION : Usage de l'Enum UserRole.PARENT
  @Roles(UserRole.PARENT)
  @Get('my-children')
  async getMyChildren(@Request() req) {
    const parentId = req.user.sub; // ID du parent connecté (User ID)
    return this.studentsService.findByParent(parentId);
  }

  // ✅ CORRECTION : Usage de l'Enum
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('class/:classId') 
  async getStudentsByClass(@Request() req, @Param('classId') classId: string) {
    const schoolId = req.user.schoolId;
    
    // Le SuperAdmin n'a pas forcément de schoolId dans son token, 
    // mais pour cette route, il devrait logiquement agir dans le contexte d'une école.
    // Pour simplifier, on demande un schoolId ici.
    if (!schoolId && req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException("Accès refusé : École non identifiée.");
    }

    return this.studentsService.findByClass(Number(classId), schoolId || 0);
  }

  // Accès : Admin, Prof, Parent (pour son enfant), Eleve (pour lui-même)
  // On laisse ouvert aux rôles authentifiés, le contrôle se fait dans le service ou via garde spécifique
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    if (isNaN(+id)) throw new NotFoundException(`ID invalide.`);

    const student = await this.studentsService.findOne(+id);
    if (!student) throw new NotFoundException(`Élève introuvable`);
    
    // 🛡️ Protection Multi-Tenant stricte
    if (req.user.schoolId && student.schoolId !== req.user.schoolId) {
        // Exception : Le SuperAdmin peut tout voir
        if (req.user.role !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException("Cet élève n'appartient pas à votre établissement.");
        }
    }
    
    // 🛡️ Protection Données : Un parent ne peut voir que SON enfant
    if (req.user.role === UserRole.PARENT && student.parentId !== req.user.sub) {
        throw new ForbiddenException("Vous n'avez pas accès au profil de cet élève.");
    }

    return student;
  }
}
