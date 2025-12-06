import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator'; // ✅ Enum

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Roles(UserRole.ADMIN) // ✅ Correction
  @Post()
  async create(@Request() req, @Body() body: any) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Opération impossible sans école.");

    return this.newsService.create({ ...body, schoolId });
  }

  // Tout le monde lit les infos (filtrées par rôle ET par école dans le service)
  // Pas de décorateur @Roles ici = accessible à tout utilisateur connecté
  @Get()
  async findAll(@Request() req) {
    const userRole = req.user.role;
    const schoolId = req.user.schoolId;

    if (!schoolId) return []; 

    return this.newsService.findForRole(userRole, schoolId);
  }
}
