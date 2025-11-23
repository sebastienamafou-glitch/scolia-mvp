import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { BulletinsService } from './bulletins.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('bulletins')
export class BulletinsController {
  constructor(private readonly bulletinsService: BulletinsService) {}

  // GET /bulletins?studentId=5&period=T1
  @Get()
  async getBulletin(
      @Query('studentId') studentId: string, 
      @Query('period') period: string
  ) {
    return this.bulletinsService.getStudentBulletin(Number(studentId), period || 'T1');
  }

  // POST /bulletins/save
  @Post('save')
  async saveAppreciation(@Body() body: { studentId: number, period: string, appreciation: string }) {
    return this.bulletinsService.saveAppreciation(body.studentId, body.period, body.appreciation);
  }
}
