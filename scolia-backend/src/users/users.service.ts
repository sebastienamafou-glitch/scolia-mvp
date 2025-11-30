// scolia-backend/src/users/users.service.ts

import { Injectable, OnModuleInit, Logger, Inject, forwardRef, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm'; 
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
        email: `admin@${this.DOMAIN_NAME}`, 
        passwordHash: hashedPassword,
        role: 'SuperAdmin',
        nom: 'Admin',
        prenom: 'System',
        schoolId: null, 
    };

    await this.usersRepository.save(superAdmin);
  }

  // --- CRUD ---
  async create(createUserDto: any): Promise<any> {
    // 1. Génération de l'email et du mot de passe temporaire
    const baseEmail = `${createUserDto.prenom.toLowerCase()}.${createUserDto.nom.toLowerCase()}`;
    let email = `${baseEmail}@${this.DOMAIN_NAME}`;
    let emailCounter = 1;

    // Vérification de l'unicité de l'email
    while (await this.usersRepository.findOne({ where: { email } })) {
        email = `${baseEmail}${emailCounter}@${this.DOMAIN_NAME}`;
        emailCounter++;
    }

    const plainPassword = Math.random().toString(36).slice(-8); // Mot de passe temporaire
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // 2. Préparation des données
    const newUser: any = {
        ...createUserDto,
        email,
        passwordHash,
        // Si l'utilisateur est un Élève et qu'une classe ID est fournie
        ...(createUserDto.classId && createUserDto.role === 'Élève' && { 
            class: { id: createUserDto.classId } 
        }),
        // On assure que les champs qui ne sont pas des colonnes (classId) sont supprimés
        classId: undefined,
    };
    
    // 3. Sauvegarde
    const savedUser = await this.usersRepository.save(newUser);

    // 4. Création du compte de paiement si applicable
    if (savedUser.role === 'Élève' || savedUser.role === 'Parent') {
        await this.paymentsService.createPaymentAccount(savedUser.id);
    }

    // On retourne le mot de passe temporaire pour l'affichage ponctuel (non stocké)
    return { ...savedUser, plainPassword };
  }

  // --- READ ---

  findAll(): Promise<User[]> {
    return this.usersRepository.find({ 
        relations: ['class'],
        order: { nom: 'ASC', prenom: 'ASC' },
    });
  }

  findAllBySchool(schoolId: number): Promise<User[]> {
    return this.usersRepository.find({ 
        where: { schoolId, role: Not('SuperAdmin') }, 
        relations: ['class'],
        order: { nom: 'ASC', prenom: 'ASC' },
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
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
  
  // ✅ NOUVELLE MÉTHODE : Mise à jour générique (Nom, Classe, Infos...) par Admin
  async updateUser(userId: number, data: any, adminSchoolId: number | null) {
    // 1. Chercher l'utilisateur
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("Utilisateur introuvable");

    // 2. Sécurité Multi-Tenant
    if (adminSchoolId && user.schoolId !== adminSchoolId) {
        throw new ForbiddenException("Vous ne pouvez pas modifier cet utilisateur.");
    }
    
    // 3. Traiter la relation de classe si elle est fournie
    if (data.classId) {
        // TypeORM: On assigne un objet relationnel
        user.class = { id: Number(data.classId) } as any; 
        delete data.classId; // On retire l'ID brut pour éviter le crash (n'existe pas dans l'entité)
    }

    // 4. Protection : On empêche de changer les champs sensibles via cette route simple
    delete data.password;
    delete data.passwordHash;
    delete data.email;
    delete data.role;
    delete data.schoolId; // On ne change pas d'école comme ça
    delete data.resetToken;
    delete data.resetTokenExp;
    
    // 5. Application des autres champs (Nom, Prenom, Infos...)
    Object.assign(user, data);

    // 6. Sauvegarde
    return this.usersRepository.save(user);
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
        // Sérialisation du JSON si le champ est de type JSON ou string
        notifQuietHours: prefs.notifQuietHours ? JSON.stringify(prefs.notifQuietHours) : null,
    };

    Object.assign(user, dataToUpdate);

    return this.usersRepository.save(user);
  }

  async resetPassword(userId: number) {
    const plainPassword = Math.random().toString(36).slice(-8);
    const newHash = await bcrypt.hash(plainPassword, 10);

    await this.usersRepository.update(userId, { passwordHash: newHash });

    return { plainPassword };
  }
}
