import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolsController } from './schools.controller';
import { School } from './entities/school.entity';
import { User } from '../users/entities/user.entity';
// 👇 1. Import du Module Users
import { UsersModule } from '../users/users.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([School, User]),
    // 👇 2. AJOUTER UsersModule ICI
    UsersModule 
  ],
  controllers: [SchoolsController],
  providers: [],
})
export class SchoolsModule {}
