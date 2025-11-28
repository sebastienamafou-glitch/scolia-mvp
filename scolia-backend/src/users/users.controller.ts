import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
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
    // Retourne le payload du JWT, contenant les informations de base de l'utilisateur
    return req.user; 
  }

  // ✅ ROUTE : Mise à jour des préférences de notification
  @Roles('Parent', 'Élève', 'Enseignant', 'Admin', 'SuperAdmin')
  @Patch('preferences')
  async updatePreferences(@Request() req, @Body() body: any) {
    const userId = req.user.sub; // ID de l'utilisateur connecté
    
    // Le service gérera la logique de mise à jour dans la base de données
    return this.usersService.updateNotificationPreferences(userId, body);
  }

  // ... autres routes existantes ...
}
