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

  // --- 1. RECUPERER LA LISTE (C'était le morceau manquant !) ---
  @Roles('Admin', 'SuperAdmin')
  @Get()
  findAll(@Request() req) {
    const mySchoolId = req.user.schoolId;
    
    // Si SuperAdmin (pas d'école), il voit tout
    if (!mySchoolId) {
        return this.usersService.findAll();
    }
    // Sinon l'Admin ne voit que son école
    return this.usersService.findAllBySchool(mySchoolId);
  }

  // --- 2. PROFIL UTILISATEUR CONNECTÉ ---
  @Roles('Parent', 'Élève', 'Enseignant', 'Admin', 'SuperAdmin')
  @Get('me')
  getProfile(@Request() req) {
    return req.user; 
  }
  
  // --- 3. CRÉATION UTILISATEUR ---
  @Post() 
  @Roles('Admin') 
  async create(@Request() req, @Body() createUserDto: CreateUserDto) {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
        throw new ForbiddenException("Opération réservée à un administrateur d'école.");
    }
    // Injection du schoolId de l'admin connecté
    return this.usersService.create({ ...createUserDto, schoolId: schoolId });
  }

  // --- 4. PRÉFÉRENCES NOTIFICATIONS ---
  @Roles('Parent', 'Élève', 'Enseignant', 'Admin', 'SuperAdmin')
  @Patch('preferences')
  async updatePreferences(@Request() req, @Body() body: any) {
    const userId = req.user.sub;
    return this.usersService.updateNotificationPreferences(userId, body);
  }
}
