import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard'; // ✅ Standardisé
import { Roles, UserRole } from '../auth/roles.decorator';

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
    
    return this.timetableService.generateWithAI(
        Number(classId), 
        constraints, 
        req.user.schoolId || 0
    );
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT, UserRole.STUDENT, UserRole.SUPER_ADMIN)
  @Get('class/:classId')
  async getByClass(@Request() req, @Param('classId') classId: string) {
    const schoolId = req.user.schoolId;
    if (!schoolId && req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException("Accès refusé.");
    }

    return this.timetableService.findByClass(Number(classId), schoolId || 0);
  }
}
