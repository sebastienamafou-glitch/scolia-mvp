import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Roles('Admin')
  @Post('generate/:classId')
  async generate(@Request() req, @Param('classId') classId: string, @Body() constraints: any) {
    if (!req.user.schoolId) throw new ForbiddenException("Accès refusé.");
    
    return this.timetableService.generateWithAI(
        Number(classId), 
        constraints, 
        req.user.schoolId
    );
  }

  // Consulter (Tout le monde)
  @Get('class/:classId')
  async getByClass(@Request() req, @Param('classId') classId: string) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Accès refusé.");

    // ✅ CORRECTION : On passe schoolId pour sécuriser la lecture
    return this.timetableService.findByClass(Number(classId), schoolId);
  }
}
