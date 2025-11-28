import { Injectable, OnModuleInit, Logger, Inject, forwardRef, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
// import { CreateUserDto } from './dto/create-user.dto'; // Optionnel si on utilise 'any' pour flexibilité
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

  // --- SEEDING ---
  private async seedUsers() {
    const count = await this.usersRepository.count();
    if (count > 0) return;

    this.logger.log('🚀 Création du Super Admin...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password', saltRounds);

    // Utilisation de 'any' pour contourner la vérification stricte de schoolId: null ici
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

  // --- CRÉATION ---
  async create(createUserDto: any): Promise<User> {
    const saltRounds = 10;
    const plainPassword = createUserDto.password || this.generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    let finalEmail = createUserDto.email;
    if (!finalEmail) {
        finalEmail = await this.generateUniqueEmail(createUserDto.prenom, createUserDto.nom);
    }

    // Extraction des champs non-User
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, email, fraisScolarite, ...userData } = createUserDto; 

    const newUser = this.usersRepository.create({
      ...userData,
      email: finalEmail, 
      passwordHash: hashedPassword,
    });

    // 💡 SÉCURITÉ TYPAGE : On force le retour en User unique
    const savedUser = (await this.usersRepository.save(newUser)) as unknown as User;
    
    // Gestion des frais
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

  // --- LECTURE & UPDATE ---
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
