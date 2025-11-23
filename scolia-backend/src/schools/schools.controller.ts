import { Controller, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
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
}
