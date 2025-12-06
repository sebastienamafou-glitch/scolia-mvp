import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // ✅ Chemin corrigé
import { RolesGuard } from '../auth/guards/roles.guard';      // ✅ Chemin corrigé
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Request() req, @Body() createNewsDto: CreateNewsDto) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Opération impossible sans école.");

    return this.newsService.create(createNewsDto, schoolId);
  }

  @Get()
  async findAll(@Request() req) {
    const userRole = req.user.role;
    const schoolId = req.user.schoolId;

    if (!schoolId) return []; 

    return this.newsService.findForRole(userRole, schoolId);
  }
}
