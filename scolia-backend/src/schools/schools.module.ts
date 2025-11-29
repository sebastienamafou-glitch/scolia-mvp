// scolia-backend/src/schools/schools.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolsController } from './schools.controller';
import { School } from './entities/school.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([School, User]),
    // ✅ ROBUSTESSE : Utilisation de forwardRef pour éviter tout problème d'initialisation cyclique
    forwardRef(() => UsersModule) 
  ],
  controllers: [SchoolsController],
  providers: [],
})
export class SchoolsModule {}
