import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { HomeworksService } from './homeworks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // ✅ Standardisé
import { RolesGuard } from '../auth/guards/roles.guard';      // ✅ Standardisé
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('homeworks')
export class HomeworksController {
  constructor(private readonly homeworksService: HomeworksService) {}

  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Post()
  async create(@Request() req, @Body() body: any) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("École non identifiée.");

    return this.homeworksService.create(body, schoolId);
  }

  @Roles(UserRole.PARENT, UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @Get('class/:classId')
  async findByClass(@Request() req, @Param('classId') classId: string) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("École non identifiée.");

    return this.homeworksService.findByClass(Number(classId), schoolId);
  }
}
