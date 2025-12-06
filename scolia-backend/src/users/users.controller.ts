import { Controller, Get, Patch, Body, Post, Request, UseGuards, ForbiddenException, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // ✅ Standardisé
import { RolesGuard } from '../auth/guards/roles.guard';      // ✅ Standardisé
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get()
  findAll(@Request() req) {
    const mySchoolId = req.user.schoolId;
    
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

    if (creatorRole === UserRole.ADMIN) {
        if (!creatorSchoolId) throw new ForbiddenException("Erreur critique: Admin sans école.");
        if (createUserDto.role === UserRole.SUPER_ADMIN) throw new ForbiddenException("Action non autorisée.");
        // On force l'école de l'admin créateur
        return this.usersService.create({ ...createUserDto, schoolId: creatorSchoolId });
    }

    if (creatorRole === UserRole.SUPER_ADMIN) {
        return this.usersService.create(createUserDto);
    }
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id')
  async update(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const adminSchoolId = req.user.schoolId;
    return this.usersService.updateUser(id, body, adminSchoolId);
  }

  // ✅ Route manquante ajoutée pour AdminDashboard
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id/reset-password')
  async resetUserPassword(@Request() req, @Param('id', ParseIntPipe) id: number) {
      const adminSchoolId = req.user.schoolId;
      const plainPassword = await this.usersService.adminResetPassword(adminSchoolId, id);
      return { plainPassword };
  }

  @Roles(UserRole.PARENT, UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('preferences')
  async updatePreferences(@Request() req, @Body() body: any) {
    const userId = req.user.sub || req.user.id;
    return this.usersService.updateNotificationPreferences(userId, body);
  }
}
