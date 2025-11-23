import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolsController } from './schools.controller';
import { School } from './entities/school.entity';
import { User } from '../users/entities/user.entity';

@Module({
  // Important : On importe School ET User car on va créer les deux en même temps
  imports: [TypeOrmModule.forFeature([School, User])], 
  controllers: [SchoolsController],
})
export class SchoolsModule {}
