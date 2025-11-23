import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard'; // Attention au chemin
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // 1. L'Admin publie une info
  @Roles('Admin')
  @Post()
  create(@Body() body: any) {
    return this.newsService.create(body);
  }

  // 2. Tout le monde lit les infos (filtrées par leur rôle)
  @Get()
  findAll(@Request() req) {
    // On récupère le rôle de l'utilisateur connecté depuis le Token
    const userRole = req.user.role; 
    return this.newsService.findForRole(userRole);
  }
}
