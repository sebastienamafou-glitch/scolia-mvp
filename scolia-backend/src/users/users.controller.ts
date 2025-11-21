// scolia-backend/src/users/users.controller.ts

import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard) // Tout le contrôleur est sécurisé
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Route : POST /users (Créer un utilisateur)
  @Roles('Admin') // Seul l'Admin peut créer des comptes
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Route : GET /users (Voir tout le monde)
  @Roles('Admin') // Seul l'Admin peut voir la liste complète
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
