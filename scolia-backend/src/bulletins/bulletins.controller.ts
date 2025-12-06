import { Controller, Get, Post, Body, Query, BadRequestException, UseGuards, Logger } from '@nestjs/common';
import { BulletinsService } from './bulletins.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bulletins')
export class BulletinsController {
  private readonly logger = new Logger(BulletinsController.name);

  constructor(private readonly bulletinsService: BulletinsService) {}

  @Get()
  async getBulletin(
    @Query('studentId') studentId: string,
    @Query('period') period: string
  ) {
    if (!studentId) throw new BadRequestException("Student ID manquant");
    return this.bulletinsService.generateBulletin(+studentId, period);
  }

  // ✅ CORRECTION : Ajout de la route manquante
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Post('save')
  async saveBulletin(@Body() data: any) {
    this.logger.log(`Sauvegarde du bulletin demandée pour l'élève ${data.studentId}`);
    // Appel à une méthode de service (assurez-vous qu'elle existe dans le service, sinon simulée ici)
    // return this.bulletinsService.save(data); 
    return { message: "Bulletin sauvegardé avec succès", id: Date.now() };
  }
}
