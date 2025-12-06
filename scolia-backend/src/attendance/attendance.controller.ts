import { Controller, Post, Body, UseGuards, Request, BadRequestException, Get, Param, ForbiddenException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // ✅ Standardisé
import { RolesGuard } from '../auth/guards/roles.guard';      // ✅ Standardisé
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('bulk')
  async saveBulk(@Request() req, @Body() dto: CreateAttendanceDto) {
    const teacherId = req.user.sub || req.user.id;
    const schoolId = req.user.schoolId;

    if (!schoolId && req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException("Contexte école manquant.");
    }

    if (!dto.students || dto.students.length === 0) {
        throw new BadRequestException("La liste des élèves est vide.");
    }

    // On passe le schoolId pour sécuriser l'enregistrement
    return this.attendanceService.saveAttendance(teacherId, dto.classId, dto.students, schoolId || 0);
  }

  @Roles(UserRole.PARENT, UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @Get('student/:studentId')
  async getByStudent(@Request() req, @Param('studentId') studentId: string) {
      // TODO: Ajouter vérification que le parent a le droit de voir cet élève
      return this.attendanceService.findByStudent(+studentId);
  }
}
