import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeworksService } from './homeworks.service';
import { HomeworksController } from './homeworks.controller';
import { Homework } from './entities/homework.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Homework]), AuthModule],
  controllers: [HomeworksController],
  providers: [HomeworksService],
})
export class HomeworksModule {}
