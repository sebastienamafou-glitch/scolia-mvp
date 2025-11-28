// scolia-backend/src/users/users.controller.ts

import { Controller, Get, Patch, Body, Post, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Route existante : GET /users/me
  @Roles('Parent', 'Élève', 'Enseignant', 'Admin', 'SuperAdmin')
  @Get('me')
  getProfile(@Request() req) {
    return req.user; 
  }
  
  // ✅ ROUTE : POST /users (Création d'un nouvel utilisateur)
  @Post() // Répond à POST /users
  @Roles('Admin') // Seuls les administrateurs d'école peuvent créer
  async create(@Request() req, @Body() createUserDto: CreateUserDto) {
    // 1. Sécurité : On injecte l'ID de l'école de l'admin pour le Multi-Tenancy
    const schoolId = req.user.schoolId;
    if (!schoolId) {
        // Le SuperAdmin ne peut pas utiliser cette route pour créer des utilisateurs normaux
        throw new ForbiddenException("Opération réservée à un administrateur d'école.");
    }
    
    // 2. Le service gérera l'auto-génération d'email/mdp et l'insertion
    return this.usersService.create({ ...createUserDto, schoolId: schoolId });
  }

  // Route existante : Mise à jour des préférences de notification
  @Roles('Parent', 'Élève', 'Enseignant', 'Admin', 'SuperAdmin')
  @Patch('preferences')
  async updatePreferences(@Request() req, @Body() body: any) {
    const userId = req.user.sub; // ID de l'utilisateur connecté
    
    // Le service gérera la logique de mise à jour dans la base de données
    return this.usersService.updateNotificationPreferences(userId, body);
  }
}
