import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { User } from '../users/entities/user.entity'; 
import { Class } from '../classes/entities/class.entity'; 

@Module({
  // Importe les entités User et Class pour que le service puisse les manipuler
  imports: [TypeOrmModule.forFeature([User, Class])], 
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService], 
})
export class NotificationsModule {}
