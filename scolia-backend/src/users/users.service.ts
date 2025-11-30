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

  // --- UTILITAIRES ---
  private sanitizeString(str: string): string {
    if (!str) return '';
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  }

  // ✅ MÉTHODE MANQUANTE 1 : Génération d'email unique
  async generateUniqueEmail(prenom: string, nom: string): Promise<string> {
    const cleanPrenom = this.sanitizeString(prenom);
    const cleanNom = this.sanitizeString(nom);
    const baseEmail = `${cleanNom}.${cleanPrenom}`; 
    let candidateEmail = `${baseEmail}@${this.DOMAIN_NAME}`;
    
    let counter = 1;
    while ((await this.usersRepository.findOne({ where: { email: candidateEmail } })) && counter < 100) {
      candidateEmail = `${baseEmail}${counter}@${this.DOMAIN_NAME}`;
      counter++;
    }
    
    if (counter >= 100) throw new BadRequestException("Impossible de générer un email unique.");

    return candidateEmail;
  }

  // --- CRÉATION ---
  async create(createUserDto: any): Promise<any> {
    const baseEmail = `${createUserDto.prenom.toLowerCase()}.${createUserDto.nom.toLowerCase()}`;
    let email = `${baseEmail}@${this.DOMAIN_NAME}`;
    
    // Si l'email est déjà fourni (ex: import CSV avec email forcé), on l'utilise, sinon on génère
    if (!createUserDto.email || createUserDto.email.indexOf('@') === -1) {
       email = await this.generateUniqueEmail(createUserDto.prenom, createUserDto.nom);
    } else {
       email = createUserDto.email;
    }

    const plainPassword = Math.random().toString(36).slice(-8); 
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const newUser: any = {
        ...createUserDto,
        email,
        passwordHash,
        ...(createUserDto.classId && createUserDto.role === 'Élève' && { 
            class: { id: createUserDto.classId } 
        }),
        classId: undefined, // Nettoyage
    };
    
    const savedUser = await this.usersRepository.save(newUser);

    // Initialisation Compte Paiement (V2)
    if (savedUser.role === 'Élève') {
        try {
            await this.paymentsService.createPaymentAccount(savedUser.id);
            // Si des frais sont fournis à la création
            if (createUserDto.fraisScolarite) {
                await this.paymentsService.setStudentTuition(
                    savedUser.id, 
                    Number(createUserDto.fraisScolarite), 
                    savedUser.schoolId ?? 0
                );
            }
        } catch (e) { console.error("Erreur init paiement", e); }
    }

    return { ...savedUser, plainPassword };
  }

  // --- LECTURE ---

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ 
        relations: ['class'],
        order: { nom: 'ASC', prenom: 'ASC' },
    });
  }

  async findAllBySchool(schoolId: number): Promise<User[]> {
    return this.usersRepository.find({ 
        where: { school: { id: schoolId }, role: Not('SuperAdmin') }, 
        relations: ['class'],
        order: { nom: 'ASC', prenom: 'ASC' },
    });
  }

  // ✅ MÉTHODE MANQUANTE 2 : Recherche par Email avec Password (pour Auth)
  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.createQueryBuilder("user")
        .where("user.email = :email", { email })
        .addSelect("user.passwordHash") // Indispensable car select: false dans l'entité
        .leftJoinAndSelect("user.school", "school")
        .getOne();
  }
  
  async findStudentsByParentId(parentId: number): Promise<User[]> {
    return this.usersRepository.find({ where: { role: 'Élève', parentId }, relations: ['class'] });
  }

  async findOneById(id: number): Promise<User | null> {
      return this.usersRepository.findOne({ where: { id }, relations: ['class', 'school'] });
  }

  // --- UPDATE ---
  
  async updateUser(userId: number, data: any, adminSchoolId: number | null) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("Utilisateur introuvable");

    if (adminSchoolId && user.schoolId !== adminSchoolId) {
        throw new ForbiddenException("Modification interdite.");
    }
    
    if (data.classId) {
        user.class = { id: Number(data.classId) } as any; 
        delete data.classId;
    }

    delete data.password; delete data.passwordHash; delete data.email;
    delete data.role; delete data.schoolId;
    
    Object.assign(user, data);
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
    if (!user) throw new NotFoundException();

    const dataToUpdate: any = {
        notifGradesEnabled: prefs.notifGradesEnabled,
        notifAbsencesEnabled: prefs.notifAbsencesEnabled,
        notifFinanceEnabled: prefs.notifFinanceEnabled,
        notifQuietHours: prefs.notifQuietHours ? JSON.stringify(prefs.notifQuietHours) : null,
    };
    Object.assign(user, dataToUpdate);
    return this.usersRepository.save(user);
  }

  // Méthode pour le reset administratif (Option A)
  async adminResetPassword(adminSchoolId: number | null, targetUserId: number): Promise<string> {
    const targetUser = await this.usersRepository.findOne({ where: { id: targetUserId }, relations: ['school'] });
    if (!targetUser) throw new NotFoundException("Utilisateur introuvable.");
    if (adminSchoolId && targetUser.schoolId !== adminSchoolId) throw new ForbiddenException("Accès interdit.");

    const tempPassword = Math.random().toString(36).slice(-6);
    const newHash = await bcrypt.hash(tempPassword, 10);
    await this.usersRepository.update(targetUserId, { passwordHash: newHash });
    return tempPassword;
  }
}
