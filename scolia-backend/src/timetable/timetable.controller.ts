import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard'; // ✅ Chemin corrigé
import { Roles, UserRole } from '../auth/roles.decorator'; // ✅ Enum

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('generate/:classId')
  async generate(@Request() req, @Param('classId') classId: string, @Body() constraints: any) {
    if (!req.user.schoolId && req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException("Accès refusé.");
    }
    
    // On passe le schoolId pour s'assurer que l'emploi du temps appartient à la bonne école
    return this.timetableService.generateWithAI(
        Number(classId), 
        constraints, 
        req.user.schoolId || 0
    );
  }

  // Tout le monde peut voir l'emploi du temps (Profs, Parents, Élèves)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT, UserRole.STUDENT, UserRole.SUPER_ADMIN)
  @Get('class/:classId')
  async getByClass(@Request() req, @Param('classId') classId: string) {
    const schoolId = req.user.schoolId;
    // Note : Un SuperAdmin (schoolId=null) peut vouloir voir l'emploi du temps d'une classe spécifique
    // Donc on ne bloque que si ce n'est pas un SuperAdmin ET qu'il n'a pas d'école.
    if (!schoolId && req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException("Accès refusé.");
    }

    return this.timetableService.findByClass(Number(classId), schoolId || 0);
  }
}
