import { Controller, Post, Body, UseGuards, Request, Get, Param, Patch, ForbiddenException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // ✅ Standardisé
import { RolesGuard } from '../auth/guards/roles.guard';      // ✅ Standardisé
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('class')
  async notifyClass(@Request() req, @Body() body: { classId: number, message: string }) {
    const schoolId = req.user.schoolId;
    if (!schoolId && req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException("École manquante.");
    }

    return this.notificationsService.notifyClass(
        body.classId, 
        body.message, 
        schoolId || 0
    );
  }

  @Post('subscribe')
  async subscribe(@Request() req, @Body() body: { token: string }) {
    return this.notificationsService.subscribe(req.user.sub, body.token);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('alert-teacher')
  async sendTeacherAlert(@Body() body: { teacherId: number, message: string }) {
      return this.notificationsService.sendTeacherAlert(body.teacherId, body.message);
  }

  @Get()
  async getMyNotifications(@Request() req) {
      return this.notificationsService.findAllUnread(req.user.sub);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
      return this.notificationsService.markAsRead(+id);
  }
}
