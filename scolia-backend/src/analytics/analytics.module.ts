import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Student } from '../students/entities/student.entity';
import { Grade } from '../grades/entities/grade.entity';
import { Fee } from '../payments/entities/fee.entity';

@Module({
  // On importe les entités dont on a besoin pour l'analyse
  imports: [TypeOrmModule.forFeature([Student, Grade, Fee])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
