// scolia-backend/src/users/users.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller'; // <-- Import
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController], // <-- Ajoutez le contrôleur ici
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
