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

  // --- ROUTE SUPER ADMIN : CRÉER UN NOUVEAU CLIENT ---
  @Roles('Admin')
  @Post('onboard')
  async onboardNewSchool(@Request() req, @Body() body: any) {
    // 1. SÉCURITÉ : Vérifier que c'est bien le Super Admin (Vous)
    // Votre schoolId est NULL, contrairement aux autres admins.
    if (req.user.schoolId !== null) {
      throw new ForbiddenException("Seul le Super Admin (Développeur) peut créer une nouvelle école.");
    }

    const { schoolName, schoolAddress, adminEmail, adminNom, adminPrenom, adminPassword } = body;

    // 2. Créer l'école
    const newSchool = this.schoolRepo.create({
      name: schoolName,
      address: schoolAddress,
    });
    const savedSchool = await this.schoolRepo.save(newSchool);

    // 3. Créer le Directeur lié à cette école
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(adminPassword, salt);

    const newAdmin = this.userRepo.create({
      email: adminEmail,
      nom: adminNom,
      prenom: adminPrenom,
      password: hash,      // Hashé pour la sécurité
      passwordHash: hash,  // Hashé
      role: 'Admin',
      school: savedSchool, // <--- C'est ici qu'on fait le lien !
      schoolId: savedSchool.id
    });
    
    await this.userRepo.save(newAdmin);

    return {
      message: "✅ Nouvelle école et administrateur créés !",
      school: savedSchool,
      admin: { email: newAdmin.email }
    };
  }

  // --- NOUVELLE ROUTE : ACTIVER/DÉSACTIVER UNE ÉCOLE ---
  @Roles('Admin')
  @Patch(':id/status')
  async updateSchoolStatus(
    @Request() req,
    @Param('id') schoolId: string,
    @Body('isActive') isActive: boolean,
  ) {
    // 1. SECURITÉ : Seul le Super Admin (schoolId === null) peut modifier l'état des écoles
    if (req.user.schoolId !== null) {
      throw new ForbiddenException("Accès refusé. Seul le Super Admin peut modifier le statut d'une école.");
    }

    const school = await this.schoolRepo.findOne({ where: { id: Number(schoolId) } });
    
    if (!school) {
        throw new NotFoundException("École non trouvée.");
    }

    school.isActive = isActive;
    await this.schoolRepo.save(school);

    return {
        message: `Statut de l'école ${school.name} mis à jour. Nouvelle valeur: ${isActive ? 'Actif' : 'Inactif'}`
    };
  }

  // --- NOUVELLE ROUTE : Récupérer toutes les écoles (pour la liste du Super Admin) ---
  @Roles('Admin')
  @Get()
  async findAllSchools(@Request() req) {
      // 1. SECURITÉ : Seul le Super Admin voit cette liste complète
      if (req.user.schoolId !== null) {
          throw new ForbiddenException("Accès refusé. Seul le Super Admin peut voir la liste de toutes les écoles.");
      }
      return this.schoolRepo.find({ order: { name: 'ASC' } });
  }
}
