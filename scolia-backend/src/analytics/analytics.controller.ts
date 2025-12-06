import { Controller, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard'; // ✅ Chemin corrigé
import { Roles, UserRole } from '../auth/roles.decorator'; // ✅ Enum

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Seul le directeur ou le SuperAdmin voit le radar
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN) 
  @Get('risk-radar')
  async getRiskRadar(@Request() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Contexte école manquant");
    
    return this.analyticsService.getRiskReport(schoolId);
  }
}
