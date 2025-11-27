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
import { randomBytes } from 'crypto'; // 👈 IMPORT AJOUTÉ

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schools')
export class SchoolsController {
  constructor(
    @InjectRepository(School) private schoolRepo: Repository<School>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private usersService: UsersService,
  ) {}

  // --- 1. ROUTE ONBOARDING (Super Admin) ---
  @Roles('Admin') 
  @Post('onboard')
  async onboardNewSchool(@Request() req, @Body() body: any) {
    // SÉCURITÉ : Seul celui SANS école (SuperAdmin) peut créer
    if (req.user.schoolId) {
      throw new ForbiddenException("Seul le Super Admin peut créer une nouvelle école.");
    }

    // On ne récupère PLUS 'adminPassword' du body
    const { schoolName, schoolAddress, schoolLogo, adminNom, adminPrenom } = body;

    // 1. Création de l'école
    const newSchool = this.schoolRepo.create({
      name: schoolName,
      address: schoolAddress,
      logo: schoolLogo, 
      isActive: true 
    });
    const savedSchool = await this.schoolRepo.save(newSchool);

    // 2. GÉNÉRATION INTELLIGENTE DE L'EMAIL
    const uniqueEmail = await this.usersService.generateUniqueEmail(adminPrenom, adminNom, 'scolia.ci');

    // 3. 🆕 GÉNÉRATION DU MOT DE PASSE PROVISOIRE
    // Génère une chaîne aléatoire de 8 caractères (ex: a7f3b9x2)
    const temporaryPassword = randomBytes(4).toString('hex');

    // 4. Hashage du mot de passe généré
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(temporaryPassword, salt);

    // 5. Création de l'Admin avec cet email et mot de passe
    const newAdmin = this.userRepo.create({
      email: uniqueEmail,
      nom: adminNom,
      prenom: adminPrenom,
      passwordHash: hash,  
      role: 'Admin',       
      school: savedSchool, 
      schoolId: savedSchool.id
    });
    
    await this.userRepo.save(newAdmin);

    // 6. 📢 RETOUR AU FRONTEND
    return {
      message: "✅ Nouvelle école et administrateur créés !",
      school: savedSchool,
      admin: { 
          nom: newAdmin.nom,
          prenom: newAdmin.prenom,
          generatedEmail: uniqueEmail,      // L'email final
          generatedPassword: temporaryPassword // 👈 LE MOT DE PASSE EN CLAIR (À afficher à l'admin)
      }
    };
  }

  // --- 2. ROUTE STATUS (Super Admin) ---
  @Roles('Admin') 
  @Patch(':id/status')
  async updateSchoolStatus(@Request() req, @Param('id') schoolId: string, @Body('isActive') isActive: boolean) {
    if (req.user.schoolId) throw new ForbiddenException("Accès refusé.");

    const school = await this.schoolRepo.findOne({ where: { id: Number(schoolId) } });
    if (!school) throw new NotFoundException("École non trouvée.");

    school.isActive = isActive;
    await this.schoolRepo.save(school);

    return { message: `Statut mis à jour : ${isActive ? 'Active' : 'Inactive'}` };
  }

  // --- 3. ROUTE LISTE (Super Admin) ---
  @Roles('Admin') 
  @Get()
  async findAllSchools(@Request() req) {
      if (req.user.schoolId) throw new ForbiddenException("Accès refusé.");
      return this.schoolRepo.find({ order: { name: 'ASC' } });
  }

  // 👇 --- 4. ROUTES POUR LE DIRECTEUR (Gérer SON école) --- 👇

  @Roles('Admin')
  @Get('my-school')
  async findMySchool(@Request() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Aucune école associée.");
    
    return this.schoolRepo.findOne({ where: { id: schoolId } });
  }

  @Roles('Admin')
  @Patch('my-school')
  async updateMySchool(@Request() req, @Body() body: { name?: string; address?: string; logo?: string; description?: string }) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Aucune école associée.");
    
    await this.schoolRepo.update(schoolId, body);
    return this.schoolRepo.findOne({ where: { id: schoolId } });
  }
}
