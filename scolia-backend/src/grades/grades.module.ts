import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { Grade } from './entities/grade.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Grade]), AuthModule],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService]
})
export class GradesModule {}
