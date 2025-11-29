// scolia-backend/src/schools/schools.controller.ts

import { 
    Controller, 
    Post, 
    Body, 
    UseGuards, 
    Request, 
    ForbiddenException, 
    Patch, 
    Get, 
    Param, 
    NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School, SchoolModules } from './entities/school.entity';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
  // 👑 ZONE SUPER ADMIN (Gestion de la plateforme SaaS)
  // =================================================================

  // --- 1. CRÉATION D'UNE NOUVELLE ÉCOLE (ONBOARDING) ---
  @Roles('SuperAdmin')
  @Post('onboard')
  async onboardNewSchool(@Request() req, @Body() body: any) {
    // Sécurité : On s'assure que c'est bien un SuperAdmin (schoolId doit être null)
    if (req.user.schoolId !== null) {
      throw new ForbiddenException("Seul le Super Admin peut créer une nouvelle école.");
    }

    const { schoolName, schoolAddress, schoolLogo, adminNom, adminPrenom } = body;

    // A. Création de l'école (Modules désactivés par défaut via l'entité)
    const newSchool = this.schoolRepo.create({
      name: schoolName,
      address: schoolAddress,
      logo: schoolLogo, 
      isActive: true 
    });
    const savedSchool = await this.schoolRepo.save(newSchool);

    // B. Génération des accès Administrateur
    // On force l'email au format pro (nom.prenom@scolia.ci) via le UsersService
    const uniqueEmail = await this.usersService.generateUniqueEmail(adminPrenom, adminNom);

    // Mot de passe temporaire aléatoire (8 caractères hexadécimaux)
    const temporaryPassword = randomBytes(4).toString('hex');
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(temporaryPassword, salt);

    // C. Création du compte Directeur
    const newAdmin = this.userRepo.create({
      email: uniqueEmail,
      nom: adminNom,
      prenom: adminPrenom,
      passwordHash: hash,  
      role: 'Admin', // Le directeur est "Admin" de son école
      school: savedSchool, 
      schoolId: savedSchool.id
    });
    
    await this.userRepo.save(newAdmin);

    // D. Retour des identifiants en clair (à afficher une seule fois au SuperAdmin)
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

  // --- 2. GESTION DES MODULES (UPSELL / FEATURE FLIPPING) ---
  // Permet d'activer/désactiver les options payantes (Cartes, SMS, IA, Radar)
  @Roles('SuperAdmin')
  @Patch(':id/modules')
  async updateSchoolModules(
      @Param('id') id: string, 
      @Body() modules: Partial<SchoolModules> // Ex: { cards: true }
  ) {
      const school = await this.schoolRepo.findOne({ where: { id: Number(id) } });
      if (!school) throw new NotFoundException("École introuvable");

      // Fusion intelligente : on garde les anciens réglages et on applique les nouveaux
      school.modules = { ...school.modules, ...modules };
      
      return this.schoolRepo.save(school);
  }

  // --- 3. ACTIVER / SUSPENDRE UNE ÉCOLE (IMPAYÉS) ---
  @Roles('SuperAdmin')
  @Patch(':id/status')
  async updateSchoolStatus(@Param('id') schoolId: string, @Body('isActive') isActive: boolean) {
    const school = await this.schoolRepo.findOne({ where: { id: Number(schoolId) } });
    if (!school) throw new NotFoundException("École non trouvée.");

    school.isActive = isActive;
    await this.schoolRepo.save(school);

    return { message: `Statut mis à jour : ${isActive ? 'Active' : 'Suspendue'}` };
  }

  // --- 4. LISTER TOUS LES CLIENTS ---
  @Roles('SuperAdmin')
  @Get()
  async findAllSchools() {
      return this.schoolRepo.find({ order: { name: 'ASC' } });
  }


  // =================================================================
  // 🏫 ZONE ADMIN CLIENT (Le Directeur gère son école)
  // =================================================================

  // --- 5. VOIR MON ÉCOLE ---
  @Roles('Admin')
  @Get('my-school')
  async findMySchool(@Request() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Aucune école associée.");
    
    return this.schoolRepo.findOne({ where: { id: schoolId } });
  }

  // --- 6. MODIFIER LES INFOS DE MON ÉCOLE ---
  @Roles('Admin')
  @Patch('my-school')
  async updateMySchool(@Request() req, @Body() body: { name?: string; address?: string; logo?: string; description?: string }) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Aucune école associée.");
    
    // 🛡️ SÉCURITÉ : On filtre le body pour empêcher le client de s'activer des modules lui-même
    // On extrait uniquement les champs autorisés
    const safeUpdateData = {
        name: body.name,
        address: body.address,
        logo: body.logo,
        description: body.description
    };

    // Nettoyage des undefined (si le client n'envoie pas tous les champs)
    Object.keys(safeUpdateData).forEach(key => safeUpdateData[key] === undefined && delete safeUpdateData[key]);
    
    await this.schoolRepo.update(schoolId, safeUpdateData);
    return this.schoolRepo.findOne({ where: { id: schoolId } });
  }
}
