import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BulletinsService } from './bulletins.service';
import { BulletinsController } from './bulletins.controller';
import { Grade } from '../grades/entities/grade.entity';
import { Student } from '../students/entities/student.entity';
import { Bulletin } from '../grades/entities/bulletin.entity'; // ✅ Correction du chemin si nécessaire

@Module({
  imports: [
      TypeOrmModule.forFeature([Grade, Student, Bulletin]) 
  ],
  controllers: [BulletinsController],
  providers: [BulletinsService]
})
export class BulletinsModule {}
