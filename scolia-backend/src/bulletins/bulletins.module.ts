import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BulletinsService } from './bulletins.service';
import { BulletinsController } from './bulletins.controller';
import { Grade } from '../grades/entities/grade.entity';
import { Student } from '../students/entities/student.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([Grade, Student]) // On a besoin d'accéder aux tables Grade et Student
  ],
  controllers: [BulletinsController],
  providers: [BulletinsService]
})
export class BulletinsModule {}
