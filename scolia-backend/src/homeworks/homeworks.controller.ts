import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { HomeworksService } from './homeworks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('homeworks')
export class HomeworksController {
  constructor(private readonly homeworksService: HomeworksService) {}

  @Roles('Enseignant')
  @Post()
  create(@Body() body: any) {
    // body attendu : { title, description, matiere, dueDate, classId }
    return this.homeworksService.create(body);
  }

  @Roles('Parent', 'Élève', 'Enseignant')
  @Get('class/:classId')
  findByClass(@Param('classId') classId: string) {
    return this.homeworksService.findByClass(Number(classId));
  }
}
