import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  // Générer (Admin uniquement)
  @Roles('Admin')
  @Post('generate/:classId')
  async generate(@Request() req, @Param('classId') classId: string, @Body() constraints: any) {
    // Vérification de sécurité Multi-Tenant
    if (!req.user.schoolId) throw new ForbiddenException("Accès refusé : École non identifiée.");
    
    return this.timetableService.generateWithAI(
        Number(classId), 
        constraints, 
        req.user.schoolId
    );
  }

  // Consulter (Tout le monde : Élève, Prof, Parent, Admin)
  @Get('class/:classId')
  async getByClass(@Param('classId') classId: string) {
    return this.timetableService.findByClass(Number(classId));
  }
}
