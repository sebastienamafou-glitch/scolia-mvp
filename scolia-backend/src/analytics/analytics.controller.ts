import { Controller, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator'; // ✅ Enum

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN) // ✅ Correction
  @Get('risk-radar')
  async getRiskRadar(@Request() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Contexte école manquant");
    
    return this.analyticsService.getRiskReport(schoolId);
  }
}
