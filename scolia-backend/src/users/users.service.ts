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
    // IMPORTANT : En production avec Neon, assurez-vous de n'exécuter seedUsers()
    // qu'au premier démarrage ou utilisez des migrations.
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

    // 1. Création du Super Admin (Utilisateur développeur)
    const usersToCreate = [
      {
        email: 'superadmin@scolia.ci',
        passwordHash: hashedPassword,
        role: 'Admin', // Le rôle est 'Admin'
        nom: 'Super',
        prenom: 'Admin',
        schoolId: null, // 🔑 CLÉ : schoolId est NULL pour le Super Admin
      },
    ];

    await this.usersRepository.save(usersToCreate);
    this.logger.log('✅ Seeding Super Admin terminé avec succès !');
  }

  // --- MÉTHODES ADMIN ---

  // Créer un nouvel utilisateur
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

  // Lister tous les utilisateurs (Super Admin global)
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'nom', 'prenom', 'email', 'role', 'classe', 'parentId', 'photo', 'schoolId'],
    });
  }

  // --- AJOUT : Lister les utilisateurs par École (Multi-Tenant) ---
  async findAllBySchool(schoolId: number): Promise<User[]> {
    return this.usersRepository.find({
        where: { school: { id: schoolId } }, // Le filtre Multi-Tenant
        order: { nom: 'ASC' },
        select: ['id', 'nom', 'prenom', 'email', 'role', 'classe', 'parentId', 'photo', 'schoolId']
    });
  }

  // --- MÉTHODES LOGIN / DASHBOARD ---

  // MÉTHODE CLÉ : Récupère les données d'utilisateur pour l'authentification
  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.createQueryBuilder("user")
        .where("user.email = :email", { email })
        // CRUCIAL : On force l'ajout du hash pour la vérification BCrypt
        .addSelect("user.passwordHash")
        .leftJoinAndSelect("user.school", "school") // Charge l'école pour schoolId
        .getOne();
  }
  
  async findStudentsByParentId(parentId: number): Promise<User[]> {
    return this.usersRepository.find({ where: { role: 'Élève', parentId } });
  }
}
