import { Controller, Get, Patch, Body, Post, Request, UseGuards, ForbiddenException, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard'; // Vérifiez que le dossier est bien 'guards'
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get()
  findAll(@Request() req) {
    const mySchoolId = req.user.schoolId;
    
    // Si pas d'école, seul le SuperAdmin passe.
    if (!mySchoolId) {
        if (req.user.role !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException("Accès refusé : Contexte école manquant.");
        }
        return this.usersService.findAll();
    }
    
    return this.usersService.findAllBySchool(mySchoolId);
  }

  @Roles(UserRole.PARENT, UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('me')
  getProfile(@Request() req) {
    return req.user; 
  }
  
  @Post() 
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN) 
  async create(@Request() req, @Body() createUserDto: CreateUserDto) {
    const creatorSchoolId = req.user.schoolId;
    const creatorRole = req.user.role;

    // Admin d'école
    if (creatorRole === UserRole.ADMIN) {
        if (!creatorSchoolId) throw new ForbiddenException("Erreur critique: Admin sans école.");
        if (createUserDto.role === UserRole.SUPER_ADMIN) throw new ForbiddenException("Action non autorisée.");
        return this.usersService.create({ ...createUserDto, schoolId: creatorSchoolId });
    }

    // SuperAdmin
    if (creatorRole === UserRole.SUPER_ADMIN) {
        return this.usersService.create(createUserDto);
    }
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() body: any) {
    const adminSchoolId = req.user.schoolId;
    return this.usersService.updateUser(Number(id), body, adminSchoolId);
  }

  @Roles(UserRole.PARENT, UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('preferences')
  async updatePreferences(@Request() req, @Body() body: any) {
    const userId = req.user.sub;
    return this.usersService.updateNotificationPreferences(userId, body);
  }
}
