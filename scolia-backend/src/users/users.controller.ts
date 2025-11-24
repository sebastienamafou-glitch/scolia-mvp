import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --- 1. RÉCUPÉRATION DES UTILISATEURS (Sécurisée Multi-Tenant) ---
  @Get()
  findAll(@Request() req) {
    const mySchoolId = req.user.schoolId; 
    
    // Si c'est le SuperAdmin (schoolId est null), il voit tout
    if (!mySchoolId) {
        return this.usersService.findAll();
    }

    // Sinon, on ne renvoie QUE les utilisateurs de l'école du demandeur
    return this.usersService.findAllBySchool(mySchoolId);
  }

  // --- 2. CRÉATION D'UTILISATEUR (Forçage de l'École) ---
  @Roles('Admin')
  @Post()
  create(@Request() req, @Body() createUserDto: any) {
    const mySchoolId = req.user.schoolId;
    
    // On force l'ID de l'école pour empêcher un Admin de créer un user ailleurs
    return this.usersService.create({
        ...createUserDto,
        schoolId: mySchoolId 
    });
  }
}
