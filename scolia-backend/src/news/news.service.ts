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

  // Créer une annonce (Admin seulement)
  create(data: Partial<News>) {
    return this.newsRepo.save(data);
  }

  // Récupérer les annonces pertinentes pour un rôle donné
  async findForRole(userRole: string): Promise<News[]> {
    return this.newsRepo.find({
      where: [
        { targetRole: 'All' }, // Tout le monde voit 'All'
        { targetRole: userRole as any } // + les messages spécifiques au rôle
      ],
      order: { createdAt: 'DESC' }, // Les plus récentes en premier
      take: 10 // On limite aux 10 dernières pour ne pas surcharger
    });
  }
}
