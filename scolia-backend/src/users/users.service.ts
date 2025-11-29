// scolia-backend/src/users/users.service.ts

import { Injectable, OnModuleInit, Logger, Inject, forwardRef, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm'; // Added 'Not' for the query filter
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  // Domaine imposé pour toute l'organisation
  private readonly DOMAIN_NAME = 'scolia.ci';

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
  }

  // --- SEEDING ---
  private async seedUsers() {
    const count = await this.usersRepository.count();
    if (count > 0) return;

    this.logger.log('🚀 Création du Super Admin...');
    const hashedPassword = await bcrypt.hash('password', 10);

    const superAdmin: any = {
        // Le SuperAdmin respecte aussi la convention ou reste spécifique
        email: `admin@${this.DOMAIN_NAME}`, 
        passwordHash: hashedPassword,
        role: 'SuperAdmin',
        nom: 'Admin',
        prenom: 'System',
        schoolId: null, 
    };

    await this.usersRepository.save(superAdmin);
    this.logger.log(`✅ Super Admin créé : admin@${this.DOMAIN_NAME}`);
  }

  // --- UTILITAIRES ---
  private generateRandomPassword(length: number = 8): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#";
    let password = "";
    for (let i = 0; i < length; ++i) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    return password;
  }

  private sanitizeString(str: string): string {
    if (!str) return '';
    // Nettoie les accents, espaces et caractères spéciaux
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  }

  // ✅ ROBUSTESSE : Génération stricte NOM.PRENOM@SCOLIA.CI
  async generateUniqueEmail(prenom: string, nom: string): Promise<string> {
    const cleanPrenom = this.sanitizeString(prenom);
    const cleanNom = this.sanitizeString(nom);
    const suffix = Math.random().toString(36).substring(2, 5);
    
    // Format demandé : nom.prenom@scolia.ci
    const baseEmail = `${cleanNom}.${cleanPrenom}`; 
    let candidateEmail = `${baseEmail}@${this.DOMAIN_NAME}`;
    
    let counter = 1;
    // Vérification d'unicité (gestion des homonymes: kone.moussa1@scolia.ci)
    while ((await this.usersRepository.findOne({ where: { email: candidateEmail } })) && counter < 100) {
      candidateEmail = `${baseEmail}${counter}@${this.DOMAIN_NAME}`;
      counter++;
    }
    
    if (counter >= 100) {
        throw new BadRequestException("Impossible de générer un email unique automatiquement.");
    }

    return `${cleanNom}.${cleanPrenom}.${suffix}@scolia.ci`;
  }

  // --- CRÉATION ---
  async create(createUserDto: any): Promise<User> {
    const plainPassword = createUserDto.password || this.generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // ⛔ ON IGNORE l'email envoyé par le formulaire/CSV.
    // ✅ ON FORCE la génération au format scolia.ci
    const finalEmail = await this.generateUniqueEmail(createUserDto.prenom, createUserDto.nom);

    const { password, email, fraisScolarite, ...userData } = createUserDto; 

    const newUser = this.usersRepository.create({
      ...userData,
      email: finalEmail, // L'email officiel
      passwordHash: hashedPassword,
    });

    // Double Cast pour TypeScript
    const savedUser = (await this.usersRepository.save(newUser)) as unknown as User;
    
    // Gestion des frais (Élèves uniquement)
    if (savedUser.role === 'Élève' && fraisScolarite) {
        try {
            await this.paymentsService.setStudentTuition(
                savedUser.id, 
                Number(fraisScolarite), 
                savedUser.schoolId ?? 0 
            );
        } catch (error) {
            this.logger.error(`Erreur définition frais: ${error}`);
        }
    }
    
    this.logger.log(`👤 Compte créé : ${finalEmail} (Rôle: ${savedUser.role})`);
    
    (savedUser as any).plainPassword = plainPassword;

    return savedUser;
  }

  // --- LECTURE ---
  async findAll(): Promise<User[]> { return this.usersRepository.find(); }

  // ✅ FIX: Correction Visibilité SuperAdmin
  // On s'assure que même si un SuperAdmin a un schoolId (erreur), il n'apparait pas dans les listes scolaires
  async findAllBySchool(schoolId: number): Promise<User[]> {
    return this.usersRepository.find({ 
        where: { 
            school: { id: schoolId },
            role: Not('SuperAdmin') // Exclure explicitement le SuperAdmin
        }, 
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

  // --- UPDATE ---
  async updatePassword(userId: number, plainPassword: string): Promise<void> {
    const newHash = await bcrypt.hash(plainPassword, 10);
    await this.usersRepository.update(userId, { passwordHash: newHash });
  }
  
  async updateResetToken(userId: number, token: string, exp: Date) {
    return this.usersRepository.update(userId, { resetToken: token, resetTokenExp: exp });
  }

  async updateNotificationPreferences(userId: number, prefs: any) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé.');

    const dataToUpdate: any = {
        notifGradesEnabled: prefs.notifGradesEnabled,
        notifAbsencesEnabled: prefs.notifAbsencesEnabled,
        notifFinanceEnabled: prefs.notifFinanceEnabled,
        notifQuietHours: prefs.notifQuietHours ? JSON.stringify(prefs.notifQuietHours) : null,
    };

    await this.usersRepository.update(userId, dataToUpdate);
    return this.usersRepository.findOne({ where: { id: userId } });
  }
}
