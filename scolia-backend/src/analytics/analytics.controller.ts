import { Controller, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // ✅ CORRIGÉ (guards)
import { RolesGuard } from '../auth/guards/roles.guard';      // ✅ CORRIGÉ (guards)
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('risk-radar')
  async getRiskRadar(@Request() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId && req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException("Contexte école manquant");
    }
    // Si SuperAdmin sans école, on retourne tableau vide ou on gère autrement
    if (!schoolId) return [];
    
    return this.analyticsService.getRiskReport(schoolId);
  }
}
