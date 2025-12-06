import { Controller, Get, Post, Body, Query, BadRequestException, UseGuards, Logger, Request, ForbiddenException } from '@nestjs/common';
import { BulletinsService } from './bulletins.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { RolesGuard } from '../auth/guards/roles.guard';      
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bulletins')
export class BulletinsController { // Assure-toi que "export" est là
  private readonly logger = new Logger(BulletinsController.name);

  constructor(private readonly bulletinsService: BulletinsService) {}

  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT, UserRole.STUDENT, UserRole.SUPER_ADMIN)
  @Get()
  async getBulletin(
    @Request() req,
    @Query('studentId') studentId: string,
    @Query('period') period: string
  ) {
    if (!studentId) throw new BadRequestException("Student ID manquant");
    
    const schoolId = req.user.schoolId;
    if (!schoolId && req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException("Accès refusé.");
    }

    return this.bulletinsService.generateBulletin(+studentId, period || 'T1', schoolId || 0);
  }

  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Post('save')
  async saveBulletin(@Request() req, @Body() data: { studentId: number, period: string, appreciation: string }) {
    const schoolId = req.user.schoolId;
    
    return this.bulletinsService.saveAppreciation(
        data.studentId, 
        data.period, 
        data.appreciation, 
        schoolId || 0
    );
  }
}
