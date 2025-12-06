import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepo: Repository<News>,
  ) {}

  create(dto: CreateNewsDto, schoolId: number) {
    const news = this.newsRepo.create({
        ...dto,
        targetRole: dto.targetRole || 'All',
        school: { id: schoolId } // Liaison Multi-Tenant
    });
    return this.newsRepo.save(news);
  }

  async findForRole(userRole: string, schoolId: number): Promise<News[]> {
    return this.newsRepo.find({
      where: [
        // Actus publiques de l'école
        { targetRole: 'All', school: { id: schoolId } }, 
        // Actus ciblées pour mon rôle dans cette école
        { targetRole: userRole, school: { id: schoolId } } 
      ],
      order: { createdAt: 'DESC' },
      take: 20
    });
  }
}
