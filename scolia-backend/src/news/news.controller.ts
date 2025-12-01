// scolia-backend/src/news/news.controller.ts

import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // 1. L'Admin publie une info POUR SON ÉCOLE
  @Roles('Admin')
  @Post()
  async create(@Request() req, @Body() body: any) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Opération impossible sans école.");

    // On force l'association à l'école de l'admin
    return this.newsService.create({ ...body, schoolId });
  }

  // 2. Tout le monde lit les infos (filtrées par rôle ET par école)
  @Get()
  async findAll(@Request() req) {
    const userRole = req.user.role;
    const schoolId = req.user.schoolId;

    if (!schoolId) return []; // SuperAdmin ou utilisateur orphelin ne voit rien par défaut

    return this.newsService.findForRole(userRole, schoolId);
  }
}
