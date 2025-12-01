// scolia-backend/src/attendance/attendance.controller.ts

import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common'; // <-- AJOUT de Get et Param
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/roles.decorator';

// DTO simulé pour la clarté (nous allons le créer dans un fichier séparé pour la vraie version)
// Pour l'instant, laissons le DTO dans le même fichier pour le débogage initial
class CreateAttendanceDto {
  classId: string;
  matiere: string;
  records: { studentId: number; status: 'Présent' | 'Absent' | 'Retard' }[];
}


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Roles('Enseignant', 'Admin')
  @Post('bulk') // Route : POST /attendance/bulk (saisie par lot)
  async createAttendance(@Body() createAttendanceDto: CreateAttendanceDto, @Request() req) {
    const teacherId = req.user.sub; // ID de l'enseignant qui saisit

    return this.attendanceService.saveAttendance(teacherId, createAttendanceDto.classId, createAttendanceDto.records);
  }

  // Route pour le Parent (Voir les absences)
  @Roles('Parent', 'Admin')
  @Get('student/:studentId') // <-- Utilisation correcte de @Get et du paramètre
  async getStudentAttendance(@Param('studentId') studentId: string) { // <-- Utilisation de @Param
      // Logique réelle : appellerait attendanceService.findByStudentId(studentId)
      return { 
          message: 'Liste des absences (Logique non implémentée, mais route protégée).',
          studentId: studentId
      };
  }
}
