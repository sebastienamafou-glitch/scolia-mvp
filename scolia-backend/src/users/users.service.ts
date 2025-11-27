// scolia-backend/src/users/users.service.ts

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
  }

  // --- INITIALISATION DE LA BASE DE DONNÉES ---
  private async seedUsers() {
    const count = await this.usersRepository.count();
    if (count > 0) {
      this.logger.log('Données existantes détectées. Seeding ignoré.');
      return;
    }

    this.logger.log('🚀 Création de l\'utilisateur Super Admin...');

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password', saltRounds);

    const usersToCreate = [
      {
        email: 'superadmin@scolia.ci',
        passwordHash: hashedPassword,
        role: 'Admin',
        nom: 'Super',
        prenom: 'Admin',
        schoolId: null, // Super Admin n'a pas d'école
      },
    ];

    await this.usersRepository.save(usersToCreate);
    this.logger.log('✅ Seeding Super Admin terminé avec succès !');
  }

  // --- MÉTHODES ADMIN ---

  async create(createUserDto: CreateUserDto): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = createUserDto;

    const newUser = this.usersRepository.create({
      ...userData, 
      passwordHash: hashedPassword, 
    });

    return this.usersRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'nom', 'prenom', 'email', 'role', 'classe', 'parentId', 'photo', 'schoolId'],
    });
  }

  async findAllBySchool(schoolId: number): Promise<User[]> {
    return this.usersRepository.find({
        where: { school: { id: schoolId } },
        order: { nom: 'ASC' },
        select: ['id', 'nom', 'prenom', 'email', 'role', 'classe', 'parentId', 'photo', 'schoolId']
    });
  }

  // --- MÉTHODES LOGIN / DASHBOARD ---

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.createQueryBuilder("user")
        .where("user.email = :email", { email })
        .addSelect("user.passwordHash")
        .leftJoinAndSelect("user.school", "school") 
        .getOne();
  }
  
  async findStudentsByParentId(parentId: number): Promise<User[]> {
    return this.usersRepository.find({ where: { role: 'Élève', parentId } });
  }

  // 👇 AJOUT : Méthode pour mettre à jour le mot de passe (Reset Password)
  async updatePassword(userId: number, plainPassword: string): Promise<void> {
    const saltRounds = 10;
    const newHash = await bcrypt.hash(plainPassword, saltRounds);

    await this.usersRepository.update(userId, { 
        passwordHash: newHash 
    });
  }
}
