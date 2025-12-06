import { 
    Controller, Post, Body, UseGuards, Request, ForbiddenException, 
    Patch, Get, Param, NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School, SchoolModules } from './entities/school.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from '../users/users.service';
import { SchoolsService } from './schools.service'; // ✅ IMPORT DU SERVICE

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schools')
export class SchoolsController {
  constructor(
    @InjectRepository(School) private schoolRepo: Repository<School>,
    // ❌ Plus besoin de userRepo ici, c'est le service qui gère la création de l'admin
    private usersService: UsersService,
    private schoolsService: SchoolsService, // ✅ INJECTION DU SERVICE
  ) {}

  // --- SUPER ADMIN : CRÉATION (CORRIGÉ) ---
  @Roles(UserRole.SUPER_ADMIN)
  @Post('onboard')
  async onboardNewSchool(@Request() req, @Body() body: any) {
    if (req.user.schoolId !== null) throw new ForbiddenException("Seul le Super Admin peut créer une nouvelle école.");

    const { adminNom, adminPrenom } = body;

    // 1. On génère l'email unique (via UsersService)
    const uniqueEmail = await this.usersService.generateUniqueEmail(adminPrenom, adminNom);

    // 2. ✅ ON DÉLÈGUE LA CRÉATION COMPLEXE AU SERVICE
    // Cela inclut la création de l'école, le hachage du mot de passe et la création de l'admin
    const result = await this.schoolsService.createSchoolWithAdmin(body, uniqueEmail);

    return {
      message: "✅ Nouvelle école créée !",
      school: result.school,
      admin: { generatedEmail: uniqueEmail, generatedPassword: result.password }
    };
  }

  // --- SUPER ADMIN : GESTION DES MODULES ---
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/modules')
  async updateSchoolModules(@Param('id') id: string, @Body() modules: Partial<SchoolModules>) {
      const school = await this.schoolRepo.findOne({ where: { id: Number(id) } });
      if (!school) throw new NotFoundException("École introuvable");

      // Si les modules sont null (vieux compte), on initialise
      const currentModules = school.modules || { cards: false, sms: false, ai_planning: false, risk_radar: false };
      school.modules = { ...currentModules, ...modules };
      
      return this.schoolRepo.save(school);
  }

  // --- SUPER ADMIN : STATUT ---
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/status')
  async updateSchoolStatus(@Param('id') schoolId: string, @Body('isActive') isActive: boolean) {
    await this.schoolRepo.update(schoolId, { isActive });
    return { message: "Statut mis à jour" };
  }

  // --- SUPER ADMIN : LISTE ---
  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  async findAllSchools() {
      return this.schoolRepo.find({ order: { name: 'ASC' } });
  }

  // --- ADMIN CLIENT : MON ÉCOLE ---
  @Roles(UserRole.ADMIN)
  @Get('my-school')
  async findMySchool(@Request() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Aucune école associée.");
    
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) {
        throw new NotFoundException("École introuvable.");
    }
    
    // 🛡️ PATCH : Si modules est null en BDD, on renvoie les défauts pour ne pas casser le Front
    if (!school.modules) {
        school.modules = { cards: false, sms: false, ai_planning: false, risk_radar: false };
    }
    return school;
  }

  @Roles(UserRole.ADMIN)
  @Patch('my-school')
  async updateMySchool(@Request() req, @Body() body: any) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException();
    
    // Sécurité : on ne laisse pas l'admin modifier ses modules lui-même
    const { modules, isActive, ...safeBody } = body; 
    
    await this.schoolRepo.update(schoolId, safeUpdateData(safeBody));
    return this.schoolRepo.findOne({ where: { id: schoolId } });
  }
}

// Petit helper pour nettoyer les objets
function safeUpdateData(body: any) {
    const allowed = ['name', 'address', 'logo', 'description'];
    const clean: any = {};
    allowed.forEach(key => { if(body[key] !== undefined) clean[key] = body[key] });
    return clean;
}
