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
import { UsersService } from '../users/users.service';
import { randomBytes } from 'crypto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schools')
export class SchoolsController {
  constructor(
    @InjectRepository(School) private schoolRepo: Repository<School>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private usersService: UsersService,
  ) {}

  // =================================================================
  // 👑 ZONE SUPER ADMIN (Gestion de la plateforme)
  // =================================================================

  // --- 1. CRÉATION D'UNE ÉCOLE ET DE SON DIRECTEUR ---
  @Roles('SuperAdmin') // 👈 CORRECTION : C'est réservé au SuperAdmin
  @Post('onboard')
  async onboardNewSchool(@Request() req, @Body() body: any) {
    // Note: Le Guard vérifie déjà le rôle, mais on peut garder une double sécu
    if (req.user.schoolId !== null) {
      throw new ForbiddenException("Seul le Super Admin peut créer une nouvelle école.");
    }

    const { schoolName, schoolAddress, schoolLogo, adminNom, adminPrenom } = body;

    // 1. Création de l'école
    const newSchool = this.schoolRepo.create({
      name: schoolName,
      address: schoolAddress,
      logo: schoolLogo, 
      isActive: true 
    });
    const savedSchool = await this.schoolRepo.save(newSchool);

    // 2. Génération email unique
    const uniqueEmail = await this.usersService.generateUniqueEmail(adminPrenom, adminNom, 'scolia.ci');

    // 3. Génération mot de passe aléatoire (8 chars)
    const temporaryPassword = randomBytes(4).toString('hex');

    // 4. Hashage
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(temporaryPassword, salt);

    // 5. Création du Directeur (Rôle: Admin)
    const newAdmin = this.userRepo.create({
      email: uniqueEmail,
      nom: adminNom,
      prenom: adminPrenom,
      passwordHash: hash,  
      role: 'Admin', // 👈 Le client, lui, reste un 'Admin' classique
      school: savedSchool, 
      schoolId: savedSchool.id
    });
    
    await this.userRepo.save(newAdmin);

    // 6. Retour des identifiants (Email + MDP en clair)
    return {
      message: "✅ Nouvelle école et administrateur créés !",
      school: savedSchool,
      admin: { 
          nom: newAdmin.nom,
          prenom: newAdmin.prenom,
          generatedEmail: uniqueEmail,
          generatedPassword: temporaryPassword 
      }
    };
  }

  // --- 2. ACTIVER / DÉSACTIVER UNE ÉCOLE ---
  @Roles('SuperAdmin') // 👈 CORRECTION
  @Patch(':id/status')
  async updateSchoolStatus(@Request() req, @Param('id') schoolId: string, @Body('isActive') isActive: boolean) {
    const school = await this.schoolRepo.findOne({ where: { id: Number(schoolId) } });
    if (!school) throw new NotFoundException("École non trouvée.");

    school.isActive = isActive;
    await this.schoolRepo.save(school);

    return { message: `Statut mis à jour : ${isActive ? 'Active' : 'Inactive'}` };
  }

  // --- 3. LISTER TOUTES LES ÉCOLES ---
  @Roles('SuperAdmin') // 👈 CORRECTION
  @Get()
  async findAllSchools(@Request() req) {
      return this.schoolRepo.find({ order: { name: 'ASC' } });
  }


  // =================================================================
  // 🏫 ZONE ADMIN CLIENT (Le Directeur gère son école)
  // =================================================================

  // --- 4. VOIR MON ÉCOLE ---
  @Roles('Admin') // 👈 CORRECT : C'est pour le client
  @Get('my-school')
  async findMySchool(@Request() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Aucune école associée.");
    
    return this.schoolRepo.findOne({ where: { id: schoolId } });
  }

  // --- 5. MODIFIER MON ÉCOLE ---
  @Roles('Admin') // 👈 CORRECT : C'est pour le client
  @Patch('my-school')
  async updateMySchool(@Request() req, @Body() body: { name?: string; address?: string; logo?: string; description?: string }) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Aucune école associée.");
    
    await this.schoolRepo.update(schoolId, body);
    return this.schoolRepo.findOne({ where: { id: schoolId } });
  }
}
