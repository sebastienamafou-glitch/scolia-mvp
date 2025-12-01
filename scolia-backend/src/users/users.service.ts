// scolia-backend/src/users/users.service.ts


import { Injectable, OnModuleInit, Logger, Inject, forwardRef, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm'; 
import { User } from './entities/user.entity';
import { Student } from '../students/entities/student.entity'; // Import Student Entity [cite: 42]
import * as bcrypt from 'bcrypt';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  private readonly DOMAIN_NAME = 'scolia.ci';

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Student) // Injection du Repo Student 
    private studentsRepository: Repository<Student>,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
  }

  // --- SEEDING & UTILS ---

  private async seedUsers() {
    const count = await this.usersRepository.count();
    if (count > 0) return;

    this.logger.log('🚀 Création du Super Admin...');
    const hashedPassword = await bcrypt.hash('password', 10);
    const superAdmin = this.usersRepository.create({
        email: `admin@${this.DOMAIN_NAME}`, 
        passwordHash: hashedPassword,
        role: 'SuperAdmin',
        nom: 'Admin',
        prenom: 'System',
        // schoolId est null pour le SuperAdmin
    });
    await this.usersRepository.save(superAdmin);
  }

  private generateRandomPassword(length: number = 8): string {
    return Math.random().toString(36).slice(-length);
  }

  private sanitizeString(str: string): string {
    if (!str) return '';
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  }

  async generateUniqueEmail(prenom: string, nom: string): Promise<string> {
    const cleanPrenom = this.sanitizeString(prenom);
    const cleanNom = this.sanitizeString(nom);
    const baseEmail = `${cleanNom}.${cleanPrenom}`; 
    let candidateEmail = `${baseEmail}@${this.DOMAIN_NAME}`;
    
    let counter = 1;
    // Vérifie jusqu'à 100 variations pour trouver un email unique
    while ((await this.usersRepository.findOne({ where: { email: candidateEmail } })) && counter < 100) {
      candidateEmail = `${baseEmail}${counter}@${this.DOMAIN_NAME}`;
      counter++;
    }
    
    if (counter >= 100) throw new BadRequestException("Impossible de générer un email unique.");
    return candidateEmail;
  }

  // --- CRÉATION ---

  async create(createUserDto: any): Promise<any> {
    // 1. Gestion de l'Email
    let email = createUserDto.email;
    if (!email || email.indexOf('@') === -1) {
       email = await this.generateUniqueEmail(createUserDto.prenom, createUserDto.nom);
    }

    // 2. Gestion du mot de passe
    const plainPassword = this.generateRandomPassword(8);
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // Extraction des données
    const { 
        password, 
        fraisScolarite, 
        classId, 
        schoolId, 
        ...userData 
    } = createUserDto;

    // 3. Création de l'entité USER (Compte de connexion)
    // Note: On n'associe pas la classe ici car elle sera liée à l'entité Student
    const newUser = this.usersRepository.create({
        ...userData,
        email,
        passwordHash,
        school: { id: Number(schoolId) },
        role: createUserDto.role
    });

    // 4. SAUVEGARDE USER
    const savedUser = (await this.usersRepository.save(newUser)) as unknown as User;

    // 5. LOGIQUE SPÉCIFIQUE ÉLÈVE (Création Profile Student + Paiement)
    if (savedUser.role === 'Élève') {
        try {
            // ✅ A. CRÉATION DU PROFIL ÉTUDIANT (Linked to User)
            const newStudent = this.studentsRepository.create({
                nom: savedUser.nom,
                prenom: savedUser.prenom,
                userId: savedUser.id, // 🔗 Lien technique User <-> Student [cite: 53]
                // On lie la classe ici, c'est plus logique académiquement
                class: classId ? { id: Number(classId) } : undefined,
            });
            
            const savedStudent = await this.studentsRepository.save(newStudent);
            this.logger.log(`✅ Profil Étudiant créé (ID: ${savedStudent.id}) pour User (ID: ${savedUser.id})`);

            // ✅ B. CRÉATION DU COMPTE PAIEMENT (Avec ID Student !)
            await this.paymentsService.createPaymentAccount(savedStudent.id); // [cite: 56]

            if (fraisScolarite) {
                await this.paymentsService.setStudentTuition(
                    savedStudent.id, // 👈 On utilise l'ID de l'étudiant, pas du User [cite: 57]
                    Number(fraisScolarite), 
                    savedUser.schoolId ?? 0
                );
            }
        } catch (e) { 
            this.logger.error("Erreur critique création profil élève/paiement", e);
            // Optionnel : Rollback manuel ici si nécessaire
        }
    }

    // Retourne l'user avec le mot de passe en clair pour affichage unique
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

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.createQueryBuilder("user")
        .where("user.email = :email", { email })
        .addSelect("user.passwordHash") // Indispensable pour l'auth
        .leftJoinAndSelect("user.school", "school")
        .getOne();
  }
  
  async findStudentsByParentId(parentId: number): Promise<User[]> {
    // Note: Si la logique change vers l'entité Student, cette requête devra peut-être
    // être adaptée pour chercher dans StudentRepository au lieu de UsersRepository
    return this.usersRepository.find({ where: { role: 'Élève', parentId }, relations: ['class'] });
  }

  async findOneById(id: number): Promise<User | null> {
      return this.usersRepository.findOne({ where: { id }, relations: ['class', 'school'] });
  }

  // --- MISE À JOUR ---

  async updateUser(userId: number, data: any, adminSchoolId: number | null) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("Utilisateur introuvable");

    // Sécurité : Vérifie que l'admin appartient à la même école
    if (adminSchoolId && user.schoolId !== adminSchoolId) {
        throw new ForbiddenException("Modification interdite.");
    }

    // Gestion relation classe
    // Note: Si la classe est désormais sur l'entité Student, ceci mettra à jour la relation 
    // sur User uniquement si User possède toujours la colonne classId.
    if (data.classId) {
        user.class = { id: Number(data.classId) } as any;
        delete data.classId;
    }

    // Nettoyage des champs sensibles
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
        notifQuietHours: prefs.notifQuietHours ?
            JSON.stringify(prefs.notifQuietHours) : null,
    };
    
    Object.assign(user, dataToUpdate);
    return this.usersRepository.save(user);
  }

  // Reset administratif
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
