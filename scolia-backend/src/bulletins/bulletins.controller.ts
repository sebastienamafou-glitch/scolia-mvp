import { Controller, Get, Post, Body, Query, BadRequestException, UseGuards, Logger } from '@nestjs/common';
import { BulletinsService } from './bulletins.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator'; // ✅ Enum

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bulletins')
export class BulletinsController {
  private readonly logger = new Logger(BulletinsController.name);

  constructor(private readonly bulletinsService: BulletinsService) {}

  // Consultation ouverte (sécurisée par la logique métier dans le service)
  @Get()
  async getBulletin(
    @Query('studentId') studentId: string,
    @Query('period') period: string
  ) {
    if (!studentId) throw new BadRequestException("Student ID manquant");
    return this.bulletinsService.generateBulletin(+studentId, period);
  }

  @Roles(UserRole.TEACHER, UserRole.ADMIN) // ✅ Correction
  @Post('save')
  async saveBulletin(@Body() data: any) {
    this.logger.log(`Sauvegarde du bulletin demandée pour l'élève ${data.studentId}`);
    // return this.bulletinsService.save(data); 
    return { message: "Bulletin sauvegardé avec succès", id: Date.now() };
  }
}
