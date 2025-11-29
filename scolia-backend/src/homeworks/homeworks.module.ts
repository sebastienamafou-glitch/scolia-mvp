// scolia-backend/src/homeworks/homeworks.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeworksService } from './homeworks.service';
import { HomeworksController } from './homeworks.controller';
import { Homework } from './entities/homework.entity';
import { AuthModule } from '../auth/auth.module';
// 👇 1. Import de l'entité Class
import { Class } from '../classes/entities/class.entity'; 

@Module({
  imports: [
    // 👇 2. Ajout de Class dans le forFeature
    TypeOrmModule.forFeature([Homework, Class]), 
    AuthModule
  ],
  controllers: [HomeworksController],
  providers: [HomeworksService],
})
export class HomeworksModule {}
