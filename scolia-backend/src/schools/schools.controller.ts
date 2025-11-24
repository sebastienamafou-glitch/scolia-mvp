// scolia-backend/src/schools/schools.controller.ts

import { Controller, Post, Body, UseGuards, Request, ForbiddenException, Patch, Get, Param, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from './entities/school.entity';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import * as bcrypt from 'bcrypt';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schools')
export class SchoolsController {
  constructor(
    @InjectRepository(School) private schoolRepo: Repository<School>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // --- 1. ROUTE ONBOARDING (Super Admin) ---
  @Roles('SuperAdmin') 
  @Post('onboard')
  async onboardNewSchool(@Request() req, @Body() body: any) {
    
    // SÉCURITÉ : Double vérification (Rôle + SchoolId null)
    if (req.user.schoolId) {
      throw new ForbiddenException("Seul le Super Admin peut créer une nouvelle école.");
    }

    const { schoolName, schoolAddress, adminEmail, adminNom, adminPrenom, adminPassword } = body;

    // 1. Création de l'école
    const newSchool = this.schoolRepo.create({
      name: schoolName,
      address: schoolAddress,
      isActive: true 
    });
    const savedSchool = await this.schoolRepo.save(newSchool);

    // 2. Création du Directeur (Admin Client)
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(adminPassword, salt);

    const newAdmin = this.userRepo.create({
      email: adminEmail,
      nom: adminNom,
      prenom: adminPrenom,
      password: hash,      
      passwordHash: hash,  
      role: 'Admin',       
      school: savedSchool, 
      schoolId: savedSchool.id
    });
    
    await this.userRepo.save(newAdmin);

    return {
      message: "✅ Nouvelle école et administrateur créés !",
      school: savedSchool,
      admin: { email: newAdmin.email }
    };
  }

  // --- 2. ROUTE STATUS (Super Admin) ---
  @Roles('SuperAdmin') // 👈 CORRECTION ICI (était 'Admin')
  @Patch(':id/status')
  async updateSchoolStatus(
    @Request() req,
    @Param('id') schoolId: string,
    @Body('isActive') isActive: boolean,
  ) {
    if (req.user.schoolId) throw new ForbiddenException("Accès refusé.");

    const school = await this.schoolRepo.findOne({ where: { id: Number(schoolId) } });
    if (!school) throw new NotFoundException("École non trouvée.");

    school.isActive = isActive;
    await this.schoolRepo.save(school);

    return { message: `Statut mis à jour : ${isActive ? 'Active' : 'Inactive'}` };
  }

  // --- 3. ROUTE LISTE (Super Admin) ---
  @Roles('SuperAdmin') // 👈 CORRECTION ICI (était 'Admin')
  @Get()
  async findAllSchools(@Request() req) {
      if (req.user.schoolId) throw new ForbiddenException("Accès refusé.");
      return this.schoolRepo.find({ order: { name: 'ASC' } });
  }
}
