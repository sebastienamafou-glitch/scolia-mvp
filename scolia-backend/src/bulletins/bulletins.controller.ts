import { Controller, Get, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { BulletinsService } from './bulletins.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bulletins')
export class BulletinsController {
  constructor(private readonly bulletinsService: BulletinsService) {}

  @Get()
  async getBulletin(
    @Query('studentId') studentId: string,
    @Query('period') period: string
  ) {
    if (!studentId) throw new BadRequestException("Student ID manquant");
    
    // On appelle le service pour générer le bulletin à la volée
    return this.bulletinsService.generateBulletin(+studentId, period);
  }
}
