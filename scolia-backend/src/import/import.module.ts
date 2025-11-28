import { Module } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { UsersModule } from '../users/users.module'; // On a besoin du UsersService

@Module({
  imports: [UsersModule], // Importe UsersModule pour avoir accès à UsersService
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}
