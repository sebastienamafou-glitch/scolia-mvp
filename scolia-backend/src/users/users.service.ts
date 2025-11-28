import { Injectable, OnModuleInit, Logger, Inject, forwardRef, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
  }

  // --- 1. INITIALISATION (SEEDING) ---
  private async seedUsers() {
    const count = await this.usersRepository.count();
    if (count > 0) return;

    this.logger.log('🚀 Création du Super Admin...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password', saltRounds);

    const superAdmin: any = {
        email: 'superadmin@scolia.ci',
        passwordHash: hashedPassword,
        role: 'SuperAdmin',
        nom: 'Super',
        prenom: 'Admin',
        schoolId: null, 
    };

    await this.usersRepository.save([superAdmin]);
    this.logger.log('✅ Super Admin créé : superadmin@scolia.ci');
  }

  // --- 2. UTILITAIRES ---
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
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  }

  async generateUniqueEmail(prenom: string, nom: string, domain: string = 'scolia.ci'): Promise<string> {
    const cleanPrenom = this.sanitizeString(prenom);
    const cleanNom = this.sanitizeString(nom);
    const baseEmail = `${cleanPrenom}.${cleanNom}`;
    let candidateEmail = `${baseEmail}@${domain}`;
    
    let counter = 1;
    while (await this.usersRepository.findOne({ where: { email: candidateEmail } })) {
      candidateEmail = `${baseEmail}${counter}@${domain}`;
      counter++;
    }
    return candidateEmail;
  }

  // --- 3. CRÉATION D'UTILISATEUR ---
  async create(createUserDto: any): Promise<User> {
    const saltRounds = 10;
    
    const plainPassword = createUserDto.password || this.generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    let finalEmail = createUserDto.email;
    if (!finalEmail) {
        finalEmail = await this.generateUniqueEmail(createUserDto.prenom, createUserDto.nom);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, email, fraisScolarite, ...userData } = createUserDto; 

    const newUser = this.usersRepository.create({
      ...userData,
      email: finalEmail, 
      passwordHash: hashedPassword,
    });

    // 💡 CORRECTION ICI : On utilise "as unknown as User" pour forcer TypeScript à accepter
    const savedUser = (await this.usersRepository.save(newUser)) as unknown as User;
    
    if (savedUser.role === 'Élève' && fraisScolarite) {
        try {
            await this.paymentsService.setStudentTuition(
                savedUser.id, 
                Number(fraisScolarite), 
                savedUser.schoolId ?? 0 
            );
            this.logger.log(`💰 Frais définis pour ${savedUser.prenom}: ${fraisScolarite}`);
        } catch (error) {
            this.logger.error(`Erreur définition frais: ${error}`);
        }
    }
    
    this.logger.log(`👤 Nouvel utilisateur : ${finalEmail}`);
    (savedUser as any).plainPassword = plainPassword;

    return savedUser;
  }

  // --- 4. AUTRES MÉTHODES ---
  async findAll(): Promise<User[]> { return this.usersRepository.find(); }

  async findAllBySchool(schoolId: number): Promise<User[]> {
    return this.usersRepository.find({ where: { school: { id: schoolId } }, order: { nom: 'ASC' } });
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
  
  async updateResetToken(userId: number, token: string, exp: Date) {
    return this.usersRepository.update(userId, { resetToken: token, resetTokenExp: exp });
  }
  
  // ✅ NOUVELLE MÉTHODE : Mettre à jour les préférences de notification
  async updateNotificationPreferences(userId: number, prefs: any) {
    // Note : Le dépôt est nommé 'usersRepository' dans ce fichier
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
        throw new NotFoundException('Utilisateur non trouvé.');
    }

    // Le backend ne met à jour que les champs définis dans l'entité
    const dataToUpdate: any = {
        notifGradesEnabled: prefs.notifGradesEnabled,
        notifAbsencesEnabled: prefs.notifAbsencesEnabled,
        notifFinanceEnabled: prefs.notifFinanceEnabled,
        // Convertit l'objet JS { start, end } en chaîne JSON pour le stockage
        notifQuietHours: prefs.notifQuietHours ? JSON.stringify(prefs.notifQuietHours) : null,
    };

    await this.usersRepository.update(userId, dataToUpdate);
    // Retourne l'utilisateur mis à jour (sans le mot de passe hashé)
    return this.usersRepository.findOne({ where: { id: userId } });
  }
}
