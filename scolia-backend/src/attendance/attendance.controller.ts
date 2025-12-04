import { Controller, Post, Body, UseGuards, Request, BadRequestException, Get, Param } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto'; // 👈 Import du DTO
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles('Enseignant', 'Admin')
  @Post('bulk')
  async saveBulk(@Request() req, @Body() dto: CreateAttendanceDto) {
    // Le DTO garantit maintenant que dto.classId et dto.students existent
    const teacherId = req.user.sub;

    // Conversion de sécurité pour s'assurer que classId est bien traité
    const classIdString = String(dto.classId);

    if (!dto.students || dto.students.length === 0) {
        throw new BadRequestException("La liste des élèves est vide.");
    }

    // Appel du service avec des données propres
    return this.attendanceService.saveAttendance(teacherId, classIdString, dto.students);
  }

  // Route pour voir l'historique d'un élève (Optionnel mais utile)
  @Get('student/:studentId')
  async getByStudent(@Param('studentId') studentId: string) {
      return this.attendanceService.findByStudent(+studentId);
  }
}
