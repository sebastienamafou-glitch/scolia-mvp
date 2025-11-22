import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Roles('Admin') // Seul l'Admin crée les classes
  @Post()
  create(@Body() body: { name: string; level: string }) {
    return this.classesService.create(body.name, body.level);
  }

  @Roles('Admin', 'Enseignant') // Profs et Admins ont besoin de la liste
  @Get()
  findAll() {
    return this.classesService.findAll();
  }
}
