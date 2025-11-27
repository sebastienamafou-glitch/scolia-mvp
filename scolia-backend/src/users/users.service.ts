// scolia-backend/src/users/users.service.ts

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm'; // 👈 Import Like ajouté
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

  // --- INITIALISATION ---
  private async seedUsers() {
    const count = await this.usersRepository.count();
    if (count > 0) return;

    this.logger.log('🚀 Création du Super Admin...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password', saltRounds);

    await this.usersRepository.save([{
        email: 'superadmin@scolia.ci',
        passwordHash: hashedPassword,
        role: 'Admin',
        nom: 'Super',
        prenom: 'Admin',
        schoolId: null, 
    }]);
    this.logger.log('✅ Super Admin créé : superadmin@scolia.ci / password');
  }

  // --- GÉNÉRATEUR DE MOT DE PASSE ALÉATOIRE ---
  private generateRandomPassword(length: number = 8): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#";
    let password = "";
    for (let i = 0; i < length; ++i) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  // --- NOUVEAU : UTILITAIRE DE NETTOYAGE ---
  private sanitizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlève les accents (é -> e)
      .replace(/[^a-z0-9]/g, ""); // Enlève tout ce qui n'est pas lettre ou chiffre
  }

  // --- NOUVEAU : GÉNÉRATEUR EMAIL INTELLIGENT (Prenom.Nom) ---
  async generateUniqueEmail(prenom: string, nom: string, domain: string = 'scolia.ci'): Promise<string> {
    // 1. Nettoyage
    const cleanPrenom = this.sanitizeString(prenom);
    const cleanNom = this.sanitizeString(nom);
    
    const baseEmail = `${cleanPrenom}.${cleanNom}`;
    let candidateEmail = `${baseEmail}@${domain}`;
    
    // 2. Vérification d'existence
    let counter = 1;
    let userExists = await this.usersRepository.findOne({ where: { email: candidateEmail } });

    // 3. Boucle tant que l'email est pris
    while (userExists) {
      candidateEmail = `${baseEmail}${counter}@${domain}`;
      userExists = await this.usersRepository.findOne({ where: { email: candidateEmail } });
      counter++;
    }

    return candidateEmail;
  }

  // --- CRÉATION UTILISATEUR (MISE À JOUR) ---
  async create(createUserDto: CreateUserDto): Promise<User> {
    const saltRounds = 10;
    
    // 1. Si pas de mot de passe fourni, on en génère un aléatoire
    const plainPassword = createUserDto.password || this.generateRandomPassword(8);
    
    // 2. Hashage
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // 3. Génération email (Mise à jour pour utiliser la nouvelle fonction)
    // Note : On passe (prenom, nom) car la nouvelle fonction génère prenom.nom
    const generatedEmail = await this.generateUniqueEmail(createUserDto.prenom, createUserDto.nom);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, email, ...userData } = createUserDto; 

    const newUser = this.usersRepository.create({
      ...userData,
      email: generatedEmail, 
      passwordHash: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(newUser);
    
    this.logger.log(`👤 Nouvel utilisateur créé : ${generatedEmail}`);
    
    // 4. On attache le mot de passe en clair à l'objet retourné (pour le frontend)
    (savedUser as any).plainPassword = plainPassword;

    return savedUser;
  }

  // --- RESTE DES MÉTHODES (Inchangées) ---

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findAllBySchool(schoolId: number): Promise<User[]> {
    return this.usersRepository.find({
        where: { school: { id: schoolId } },
        order: { nom: 'ASC' }
    });
  }

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

  async findOneById(id: number): Promise<User | null> {
      return this.usersRepository.findOne({ where: { id } });
  }

  async updatePassword(userId: number, plainPassword: string): Promise<void> {
    const saltRounds = 10;
    const newHash = await bcrypt.hash(plainPassword, saltRounds);
    await this.usersRepository.update(userId, { passwordHash: newHash });
  }
}
