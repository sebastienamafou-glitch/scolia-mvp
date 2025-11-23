import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common'; // Ajout de Request
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Récupérer UNIQUEMENT les gens de mon école
  @Get()
  findAll(@Request() req) {
    const mySchoolId = req.user.schoolId; // Récupéré automatiquement du Token
    
    // Si c'est un SuperAdmin (sans école), il voit tout, sinon on filtre
    if (!mySchoolId) return this.usersService.findAll(); 

    return this.usersService.findAllBySchool(mySchoolId);
  }

  // Créer un utilisateur dans MON école
  @Roles('Admin')
  @Post()
  create(@Request() req, @Body() createUserDto: any) {
    const mySchoolId = req.user.schoolId;
    
    // On force l'ID de l'école de l'admin créateur
    return this.usersService.create({
        ...createUserDto,
        schoolId: mySchoolId 
    });
  }
}
