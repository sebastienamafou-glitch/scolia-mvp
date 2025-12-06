// scolia-backend/src/schools/schools.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School, SchoolModules } from './entities/school.entity';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

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
    const newAdmin = this.userRepo.create({
      email: uniqueEmail,
      nom: data.adminNom,
      prenom: data.adminPrenom,
      passwordHash: hash,
      role: UserRole.ADMIN,
      school: savedSchool,
    });
    
    await this.userRepo.save(newAdmin);

    return { school: savedSchool, password: temporaryPassword };
  }
  
  // Ajoute ici les méthodes findOne, update, etc.
}
