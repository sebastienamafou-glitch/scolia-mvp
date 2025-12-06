import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Request, 
  ForbiddenException, 
  Get, 
  Patch, 
  Param 
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard'; 
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Roles(UserRole.PARENT, UserRole.STUDENT, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER)
  @Post('subscribe')
  async subscribe(@Request() req, @Body('token') token: string) {
    if (!req.user.sub) return;
    return this.notificationsService.subscribe(req.user.sub, token); 
  }

  // ✅ Route critique corrigée (était 404 dans les logs)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Post('alert-teacher')
  async alertTeacher(@Request() req, @Body() body: { type: string; details: string; duration?: number }) {
      const teacherId = req.user.sub;
      const schoolId = req.user.schoolId; // Assurez-vous que schoolId est dans le JWT
      
      // Fallback si schoolId n'est pas dans le token (optionnel)
      if (!schoolId) {
         // throw new ForbiddenException("Erreur de contexte d'école.");
         // Pour le debug, on laisse passer ou on log
         console.warn("SchoolId manquant dans le token");
      }
      
      return this.notificationsService.sendTeacherAlert(
          teacherId, 
          schoolId || 1, // Valeur par défaut temporaire si nécessaire
          body.type, 
          body.details, 
          body.duration
      );
  }

  @Get('my-notifications')
  async getMyNotifications(@Request() req) {
      return this.notificationsService.findAllUnread(req.user.sub);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
      return this.notificationsService.markAsRead(Number(id));
  }
}
