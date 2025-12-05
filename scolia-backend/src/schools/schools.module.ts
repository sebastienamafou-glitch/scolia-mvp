import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service'; // 👈 Import
import { School } from './entities/school.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([School, User]),
    forwardRef(() => UsersModule) 
  ],
  controllers: [SchoolsController],
  providers: [SchoolsService], // 👈 Ajout ici
  exports: [SchoolsService]    // 👈 Utile si d'autres modules ont besoin de SchoolsService
})
export class SchoolsModule {}
