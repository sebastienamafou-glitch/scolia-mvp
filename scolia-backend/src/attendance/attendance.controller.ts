import { Controller, Post, Body, UseGuards, Request, BadRequestException, Get, Param } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
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
    const teacherId = req.user.sub;

    if (!dto.students || dto.students.length === 0) {
        throw new BadRequestException("La liste des élèves est vide.");
    }

    // Le DTO a déjà converti classId en number, mais on le passe en string si ton service attend une string
    // Si ton service attend un number, enlève String(...)
    return this.attendanceService.saveAttendance(teacherId, String(dto.classId), dto.students);
  }

  @Get('student/:studentId')
  async getByStudent(@Param('studentId') studentId: string) {
      return this.attendanceService.findByStudent(+studentId);
  }
}
