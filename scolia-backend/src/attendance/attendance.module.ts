import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 👈 AJOUTEZ CETTE LIGNE
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AuthModule } from '../auth/auth.module';
import { Student } from '../students/entities/student.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Student]) 
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
