// scolia-backend/src/students/students.module.ts

import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { UsersModule } from '../users/users.module'; // Nécessaire pour injecter UsersService

@Module({
  imports: [UsersModule], // Importe le module contenant UsersService
  controllers: [StudentsController],
  providers: [],
})
export class StudentsModule {}
