// scolia-backend/src/users/users.controller.ts

import { Controller, Get, Patch, Body, Post, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('Admin', 'SuperAdmin')
  @Get()
  findAll(@Request() req) {
    const mySchoolId = req.user.schoolId;
    // Si SuperAdmin (pas d'école liée), il voit tout. Sinon, filtre par école.
    if (!mySchoolId) {
        return this.usersService.findAll();
    }
    return this.usersService.findAllBySchool(mySchoolId);
  }

  @Roles('Parent', 'Élève', 'Enseignant', 'Admin', 'SuperAdmin')
  @Get('me')
  getProfile(@Request() req) {
    return req.user; 
  }
  
  // ✅ CORRECTION ROBUSTE : Gestion intelligente du SchoolId
  @Post() 
  @Roles('Admin', 'SuperAdmin') // SuperAdmin autorisé aussi
  async create(@Request() req, @Body() createUserDto: CreateUserDto) {
    const creatorSchoolId = req.user.schoolId;
    const creatorRole = req.user.role;

    // Cas 1: Admin d'école -> On force son école (Sécurité)
    if (creatorRole === 'Admin') {
        if (!creatorSchoolId) throw new ForbiddenException("Erreur critique: Admin sans école.");
        
        // 👇 SÉCURITÉ AJOUTÉE : Interdire la création de SuperAdmin par un Admin
        if (createUserDto.role === 'SuperAdmin') {
            throw new ForbiddenException("Vous ne pouvez pas créer de SuperAdmin.");
        }

        return this.usersService.create({ ...createUserDto, schoolId: creatorSchoolId });
    }

    // Cas 2: SuperAdmin -> On utilise l'ID fourni dans le formulaire (ou null)
    if (creatorRole === 'SuperAdmin') {
        return this.usersService.create(createUserDto);
    }
  }

  @Roles('Parent', 'Élève', 'Enseignant', 'Admin', 'SuperAdmin')
  @Patch('preferences')
  async updatePreferences(@Request() req, @Body() body: any) {
    const userId = req.user.sub;
    return this.usersService.updateNotificationPreferences(userId, body);
  }
}
