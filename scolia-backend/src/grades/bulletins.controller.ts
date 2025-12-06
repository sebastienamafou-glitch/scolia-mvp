// scolia-backend/src/grades/bulletins.controller.ts

import { Controller, Get, Param, UseGuards, Request, ForbiddenException, Body, Post } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
// ✅ CORRECTION : guards (pluriel)
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator';
import { BulletinsService } from './bulletins.service'; // ✅ Utiliser le bon service

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bulletins')
export class BulletinsController {
  constructor(private readonly bulletinsService: BulletinsService) {}

  @Roles(UserRole.PARENT, UserRole.STUDENT, UserRole.ADMIN, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @Get(':studentId')
  async getBulletin(@Request() req, @Param('studentId') studentId: string) {
    // Par défaut, on regarde le Trimestre 1. 
    // Idéalement, passer la période en query param ?period=T2
    const period = (req.query?.period as string) || 'T1';
    
    return this.bulletinsService.getStudentBulletin(Number(studentId), period);
  }

  // Route pour sauvegarder l'appréciation (Admin/Prof principal)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Post('appreciation')
  async saveAppreciation(@Body() body: { studentId: number, period: string, text: string }) {
      return this.bulletinsService.saveAppreciation(body.studentId, body.period, body.text);
  }
}
