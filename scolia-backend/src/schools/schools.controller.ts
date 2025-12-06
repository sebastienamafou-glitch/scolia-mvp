import { 
    Controller, Post, Body, UseGuards, Request, ForbiddenException, 
    Patch, Get, Param, NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School, SchoolModules } from './entities/school.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // ✅ Standardisé
import { RolesGuard } from '../auth/guards/roles.guard';      // ✅ Standardisé
import { UsersService } from '../users/users.service';
import { SchoolsService } from './schools.service'; 
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schools')
export class SchoolsController {
  constructor(
    private readonly schoolsService: SchoolsService,
    private readonly usersService: UsersService,
    @InjectRepository(School) 
    private schoolRepo: Repository<School>
  ) {}

  @Roles(UserRole.SUPER_ADMIN)
  @Post('onboard')
  async onboardNewSchool(@Request() req, @Body() body: any) {
    if (req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException("Seul le Super Admin peut créer une nouvelle école.");
    }

    const { adminNom, adminPrenom } = body;
    const uniqueEmail = await this.usersService.generateUniqueEmail(adminPrenom, adminNom);
    const result = await this.schoolsService.createSchoolWithAdmin(body, uniqueEmail);

    return {
      message: "✅ Nouvelle école créée !",
      school: result.school,
      admin: { generatedEmail: uniqueEmail, generatedPassword: result.password }
    };
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/modules')
  async updateSchoolModules(@Param('id') id: string, @Body() modules: Partial<SchoolModules>) {
      const school = await this.schoolRepo.findOne({ where: { id: Number(id) } });
      if (!school) throw new NotFoundException("École introuvable");

      const currentModules = school.modules || { cards: false, sms: false, ai_planning: false, risk_radar: false };
      school.modules = { ...currentModules, ...modules };
      
      return this.schoolRepo.save(school);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/status')
  async updateSchoolStatus(@Param('id') schoolId: string, @Body('isActive') isActive: boolean) {
    await this.schoolRepo.update(schoolId, { isActive });
    return { message: "Statut mis à jour" };
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  async findAllSchools() {
      return this.schoolRepo.find({ order: { name: 'ASC' } });
  }

  @Roles(UserRole.ADMIN)
  @Get('my-school')
  async findMySchool(@Request() req) {
    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Aucune école associée.");
    
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) {
        throw new NotFoundException("École introuvable.");
    }
    
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
    
    const { modules, isActive, ...safeBody } = body; 
    
    await this.schoolRepo.update(schoolId, safeUpdateData(safeBody));
    return this.schoolRepo.findOne({ where: { id: schoolId } });
  }
}

function safeUpdateData(body: any) {
    const allowed = ['name', 'address', 'logo', 'description'];
    const clean: any = {};
    allowed.forEach(key => { if(body[key] !== undefined) clean[key] = body[key] });
    return clean;
}
