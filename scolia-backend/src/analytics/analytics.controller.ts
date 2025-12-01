import { Controller, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Roles('Admin') // Seul le directeur voit ces infos sensibles
  @Get('risk-radar')
  async getRiskRadar(@Request() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException();
    
    return this.analyticsService.getRiskReport(schoolId);
  }
}
