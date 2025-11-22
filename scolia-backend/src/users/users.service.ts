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

    this.logger.log('🚀 Création des utilisateurs initiaux (Admin, Prof, Parent)...');

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password', saltRounds);

    // 1. Création des adultes
    // CORRECTION : On utilise 'passwordHash' et non 'password'
    const usersToCreate = [
      {
        email: 'admin@scolia.ci',
        passwordHash: hashedPassword, // <--- Corrigé ici
        role: 'Admin',
        nom: 'Admin',
        prenom: 'Système',
      },
      {
        email: 'parent@scolia.ci',
        passwordHash: hashedPassword, // <--- Corrigé ici
        role: 'Parent',
        nom: 'Kouame',
        prenom: 'Parent',
      },
      {
        email: 'prof@scolia.ci',
        passwordHash: hashedPassword, // <--- Corrigé ici
        role: 'Enseignant',
        nom: 'Traoré',
        prenom: 'Professeur',
      },
    ];

    const savedUsers = await this.usersRepository.save(usersToCreate);
    const parentUser = savedUsers.find(u => u.role === 'Parent');

    // 2. Création des élèves liés au parent
    if (parentUser) {
        const studentsToCreate = [
            {
                email: 'eleve1@scolia.ci',
                passwordHash: hashedPassword, // <--- Corrigé ici
                role: 'Élève',
                nom: 'Kouame',
                prenom: 'Jean',
                classe: '6ème A',
                parentId: parentUser.id,
            },
            {
                email: 'eleve2@scolia.ci',
                passwordHash: hashedPassword, // <--- Corrigé ici
                role: 'Élève',
                nom: 'Kouame',
                prenom: 'Marie',
                classe: '3ème C',
                parentId: parentUser.id,
            },
        ];
        await this.usersRepository.save(studentsToCreate);
    }

    this.logger.log('✅ Seeding terminé avec succès !');
  }

  // --- MÉTHODES ADMIN ---

  // Créer un nouvel utilisateur
  async create(createUserDto: CreateUserDto): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // CORRECTION IMPORTANTE :
    // On extrait le mot de passe en clair (password) pour ne pas l'envoyer à l'entité
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = createUserDto;

    const newUser = this.usersRepository.create({
      ...userData, // On passe tout le reste (nom, prenom, email...)
      passwordHash: hashedPassword, // On assigne le hash à la bonne colonne
    });

    return this.usersRepository.save(newUser);
  }

  // Lister tous les utilisateurs
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'nom', 'prenom', 'email', 'role', 'classe', 'parentId'],
    });
  }

  // --- MÉTHODES LOGIN / DASHBOARD ---

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }
  
  async findStudentsByParentId(parentId: number): Promise<User[]> {
    return this.usersRepository.find({ where: { role: 'Élève', parentId } });
  }
}
