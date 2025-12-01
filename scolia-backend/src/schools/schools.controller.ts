import { 
    Controller, Post, Body, UseGuards, Request, ForbiddenException, 
    Patch, Get, Param, NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School, SchoolModules } from './entities/school.entity';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
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

  // --- SUPER ADMIN : CRÉATION ---
  @Roles('SuperAdmin')
  @Post('onboard')
  async onboardNewSchool(@Request() req, @Body() body: any) {
    if (req.user.schoolId !== null) throw new ForbiddenException("Seul le Super Admin peut créer une nouvelle école.");

    const { schoolName, schoolAddress, schoolLogo, adminNom, adminPrenom } = body;

    const newSchool = this.schoolRepo.create({
      name: schoolName,
      address: schoolAddress,
      logo: schoolLogo, 
      isActive: true,
      modules: { cards: false, sms: false, ai_planning: false, risk_radar: false }
    });
    const savedSchool = await this.schoolRepo.save(newSchool);

    const uniqueEmail = await this.usersService.generateUniqueEmail(adminPrenom, adminNom);
    const temporaryPassword = randomBytes(4).toString('hex');
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(temporaryPassword, salt);

    const newAdmin = this.userRepo.create({
      email: uniqueEmail,
      nom: adminNom,
      prenom: adminPrenom,
      passwordHash: hash,  
      role: 'Admin',
      school: savedSchool, 
      // NOTE: schoolId est géré par la relation 'school' (insert: false dans l'entité User)
    });
    
    await this.userRepo.save(newAdmin);

    return {
      message: "✅ Nouvelle école créée !",
      school: savedSchool,
      admin: { generatedEmail: uniqueEmail, generatedPassword: temporaryPassword }
    };
  }

  // --- SUPER ADMIN : GESTION DES MODULES ---
  @Roles('SuperAdmin')
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
  @Roles('SuperAdmin')
  @Patch(':id/status')
  async updateSchoolStatus(@Param('id') schoolId: string, @Body('isActive') isActive: boolean) {
    await this.schoolRepo.update(schoolId, { isActive });
    return { message: "Statut mis à jour" };
  }

  // --- SUPER ADMIN : LISTE ---
  @Roles('SuperAdmin')
  @Get()
  async findAllSchools() {
      return this.schoolRepo.find({ order: { name: 'ASC' } });
  }

  // --- ADMIN CLIENT : MON ÉCOLE ---
  @Roles('Admin')
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

  @Roles('Admin')
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
