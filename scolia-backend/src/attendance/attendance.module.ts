// scolia-backend/src/attendance/attendance.module.ts

import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AuthModule } from '../auth/auth.module'; // Nécessaire pour les guards

@Module({
  imports: [AuthModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
