// scolia-backend/src/users/users.controller.ts

import { Controller, Get, Patch, Body, Post, Request, UseGuards, ForbiddenException, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('Admin', 'SuperAdmin')
  @Get()
  findAll(@Request() req) {
    const mySchoolId = req.user.schoolId;
    const userRole = req.user.role;

    // 🚨 SÉCURITÉ : Si pas d'école, seul le SuperAdmin passe.
    if (!mySchoolId) {
        if (userRole !== 'SuperAdmin') {
            throw new ForbiddenException("Accès refusé : Contexte école manquant.");
        }
        return this.usersService.findAll();
    }
    
    // Sinon comportement normal (filtré par école)
    return this.usersService.findAllBySchool(mySchoolId);
  }

  @Roles('Parent', 'Élève', 'Enseignant', 'Admin', 'SuperAdmin')
  @Get('me')
  getProfile(@Request() req) {
    return req.user; 
  }
  
  @Post() 
  @Roles('Admin', 'SuperAdmin') 
  async create(@Request() req, @Body() createUserDto: CreateUserDto) {
    const creatorSchoolId = req.user.schoolId;
    const creatorRole = req.user.role;

    // Admin d'école : Doit avoir un schoolId
    if (creatorRole === 'Admin') {
        if (!creatorSchoolId) throw new ForbiddenException("Erreur critique: Admin sans école.");
        // Interdiction de créer un SuperAdmin
        if (createUserDto.role === 'SuperAdmin') throw new ForbiddenException("Action non autorisée.");
        return this.usersService.create({ ...createUserDto, schoolId: creatorSchoolId });
    }

    // SuperAdmin : OK
    if (creatorRole === 'SuperAdmin') {
        return this.usersService.create(createUserDto);
    }
  }

  // NOUVEAU : Route pour la mise à jour d'un utilisateur par un Admin
  @Roles('Admin', 'SuperAdmin')
  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() body: any) {
    const adminSchoolId = req.user.schoolId;
    // On appelle une nouvelle méthode du service
    return this.usersService.updateUser(Number(id), body, adminSchoolId);
  }

  @Roles('Parent', 'Élève', 'Enseignant', 'Admin', 'SuperAdmin')
  @Patch('preferences')
  async updatePreferences(@Request() req, @Body() body: any) {
    const userId = req.user.sub;
    return this.usersService.updateNotificationPreferences(userId, body);
  }
}
