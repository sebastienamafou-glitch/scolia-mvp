// scolia-backend/src/classes/classes.controller.ts

import { 
    Controller, 
    Get, 
    Post, 
    Delete, // 👈 Ajout de l'import Delete
    Body, 
    UseGuards, 
    Request, 
    ForbiddenException, 
    Param, 
    ParseIntPipe 
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Request() req, @Body() createClassDto: CreateClassDto) {
    const schoolId = req.user.schoolId;
    // Vérification de sécurité multi-tenant 
    if (!schoolId) throw new ForbiddenException("Opération réservée aux administrateurs d'école.");

    return this.classesService.create(createClassDto, schoolId);
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get()
  async findAll(@Request() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("École non identifiée.");

    return this.classesService.findAllBySchool(schoolId);
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
      return this.classesService.findOne(id, req.user.schoolId);
  }

  // 👇 NOUVELLE ROUTE POUR LA SUPPRESSION 👇
  // Seul l'ADMIN peut supprimer (CRUD complet) [cite: 69]
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
      const schoolId = req.user.schoolId;
      if (!schoolId) throw new ForbiddenException("Opération impossible.");
      
      // On passe schoolId pour s'assurer qu'on ne supprime que NOS classes
      return this.classesService.remove(id, schoolId);
  }
}
