// scolia-backend/src/import/import.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 👈 Import TypeOrm
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { UsersModule } from '../users/users.module';
import { Class } from '../classes/entities/class.entity'; // 👈 Import Entité Class

@Module({
  imports: [
    UsersModule, 
    TypeOrmModule.forFeature([Class]) // 👈 INDISPENSABLE pour injecter le repository
  ],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}
