import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { Grade } from './entities/grade.entity';
import { Bulletin } from './entities/bulletin.entity';
import { BulletinsService } from './bulletins.service';
import { BulletinsController } from './bulletins.controller';
// 👇 1. AJOUTER L'IMPORT
import { Student } from '../students/entities/student.entity'; 
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    // 👇 2. AJOUTER Student DANS CETTE LISTE
    TypeOrmModule.forFeature([Grade, Bulletin, Student]), 
    NotificationsModule 
  ],
  controllers: [GradesController, BulletinsController],
  providers: [GradesService, BulletinsService],
  exports: [GradesService]
})
export class GradesModule {}
