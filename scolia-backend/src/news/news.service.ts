// scolia-backend/src/news/news.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepo: Repository<News>,
  ) {}

  create(data: Partial<News>) {
    // data contient maintenant { ..., schoolId: 12 }
    return this.newsRepo.save(data);
  }

  // ✅ FILTRAGE MULTI-TENANT
  async findForRole(userRole: string, schoolId: number): Promise<News[]> {
    return this.newsRepo.find({
      where: [
        // Cas 1 : Message pour tout le monde DANS CETTE ÉCOLE
        { targetRole: 'All', school: { id: schoolId } }, 
        // Cas 2 : Message pour mon rôle DANS CETTE ÉCOLE
        { targetRole: userRole as any, school: { id: schoolId } } 
      ],
      order: { createdAt: 'DESC' },
      take: 20 // J'ai augmenté un peu la limite
    });
  }
}
