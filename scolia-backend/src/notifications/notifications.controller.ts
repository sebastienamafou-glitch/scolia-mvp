import { Controller, Post, Body, UseGuards, Request, Get, Param, Patch, ForbiddenException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // 1. Envoyer une notif à toute une classe (Prof/Admin)
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('class')
  async notifyClass(@Request() req, @Body() body: { classId: number, message: string }) {
    const schoolId = req.user.schoolId;
    if (!schoolId && req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException("École manquante.");
    }

    // ✅ CORRECTION CRITIQUE (Ligne qui faisait planter le build avec "Expected 2 args but got 5")
    // On ne passe QUE les 3 arguments acceptés par le service.
    // On ignore body.type, body.details, etc. pour l'instant.
    return this.notificationsService.notifyClass(
        body.classId, 
        body.message, 
        schoolId || 0
    );
  }

  // 2. S'abonner aux notifs Push (Sauvegarde du token FCM)
  @Post('subscribe')
  async subscribe(@Request() req, @Body() body: { token: string }) {
    return this.notificationsService.subscribe(req.user.sub, body.token);
  }

  // 3. Envoyer une alerte spécifique (Admin -> Prof)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('alert-teacher')
  async sendTeacherAlert(@Body() body: { teacherId: number, message: string }) {
      return this.notificationsService.sendTeacherAlert(body.teacherId, body.message);
  }

  // 4. Lire mes notifications
  @Get()
  async getMyNotifications(@Request() req) {
      return this.notificationsService.findAllUnread(req.user.sub);
  }

  // 5. Marquer comme lu
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
      return this.notificationsService.markAsRead(+id);
  }
}
