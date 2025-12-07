// scolia-backend/src/schools/schools.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from './entities/school.entity';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto'; 
import { UserRole } from '../auth/roles.decorator';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectRepository(School) private schoolRepo: Repository<School>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async createSchoolWithAdmin(data: any, uniqueEmail: string) {
    // 1. Créer l'école
    const newSchool = this.schoolRepo.create({
      name: data.schoolName,
      address: data.schoolAddress,
      logo: data.schoolLogo,
      isActive: true,
      modules: { cards: false, sms: false, ai_planning: false, risk_radar: false }
    });
    const savedSchool = await this.schoolRepo.save(newSchool);

    // 2. Générer le mot de passe
    const temporaryPassword = randomBytes(4).toString('hex');
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(temporaryPassword, salt);

    // 3. Créer l'admin
    // CORRECTION : On retire 'nom' et 'prenom' qui n'existent pas dans User
    // CORRECTION : On utilise 'password' au lieu de 'passwordHash'
    const newAdmin = this.userRepo.create({
      email: uniqueEmail,
      password: hash, 
      role: UserRole.ADMIN,
      school: savedSchool,
      isActive: true
    });
    
    await this.userRepo.save(newAdmin);

    return { school: savedSchool, password: temporaryPassword };
  }
  
  async findOne(id: number) {
      return this.schoolRepo.findOne({ where: { id } });
  }
}
