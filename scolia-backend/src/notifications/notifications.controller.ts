// scolia-backend/src/notifications/notifications.controller.ts

import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Request, 
  ForbiddenException, 
  Get,   // 👈 Ajouté
  Patch, // 👈 Ajouté
  Param  // 👈 Ajouté
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard'; 
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Roles('Parent', 'Élève', 'Admin', 'SuperAdmin', 'Enseignant')
  @Post('subscribe')
  async subscribe(@Request() req, @Body('token') token: string) {
    if (!req.user.sub) return;
    return this.notificationsService.subscribe(req.user.sub, token); 
  }

  // ✅ NOUVELLE ROUTE : Déclaration d'absence par le professeur
  @Roles('Enseignant')
  @Post('alert-teacher')
  async alertTeacher(@Request() req, @Body() body: { type: string; details: string; duration?: number }) {
      const teacherId = req.user.sub;
      const schoolId = req.user.schoolId;
      
      if (!schoolId) throw new ForbiddenException("Erreur de contexte d'école.");
      
      return this.notificationsService.sendTeacherAlert(
          teacherId, 
          schoolId, 
          body.type, 
          body.details, 
          body.duration
      );
  }

  // ✅ NOUVELLE ROUTE : Récupérer mes notifications non-lues
  // Accessible par tout utilisateur authentifié (Pas de décorateur @Roles spécifique ici = tous rôles)
  @Get('my-notifications')
  async getMyNotifications(@Request() req) {
      // Appel à la méthode du service (plus propre que d'accéder au repo directement)
      return this.notificationsService.findAllUnread(req.user.sub);
  }

  // ✅ NOUVELLE ROUTE : Marquer une notification comme lue
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
      return this.notificationsService.markAsRead(Number(id));
  }
}
