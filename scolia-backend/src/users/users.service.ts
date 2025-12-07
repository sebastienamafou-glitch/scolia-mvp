// scolia-backend/src/users/users.service.ts

import { Injectable, OnModuleInit, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, DataSource } from 'typeorm'; 
import { User } from './entities/user.entity';
import { Student } from '../students/entities/student.entity'; 
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRole } from '../auth/roles.decorator';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  private readonly DOMAIN_NAME = 'scolia.ci';

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    private eventEmitter: EventEmitter2,
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
  }

  private async seedUsers() {
    const count = await this.usersRepository.count();
    if (count > 0) return;
    this.logger.log('🚀 Seeding: Création du Super Admin...');
    
    // Correction: 'password' au lieu de 'passwordHash'
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Correction: On retire 'nom' et 'prenom' qui n'existent pas dans User
    const superAdmin = this.usersRepository.create({
        email: `admin@${this.DOMAIN_NAME}`, 
        password: hashedPassword, 
        role: UserRole.SUPER_ADMIN,
        isActive: true
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
    while ((await this.usersRepository.findOne({ where: { email: candidateEmail } })) && counter < 100) {
      candidateEmail = `${baseEmail}${counter}@${this.DOMAIN_NAME}`;
      counter++;
    }
    return candidateEmail;
  }

  async create(createUserDto: any): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        let email = createUserDto.email;
        // Génération auto de l'email si absent
        if (!email || email.indexOf('@') === -1) {
           // On utilise les infos du DTO, pas de l'entité User
           email = await this.generateUniqueEmail(createUserDto.prenom, createUserDto.nom);
        } else {
           email = email.toLowerCase();
        }
    
        const plainPassword = this.generateRandomPassword(8);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
        // Extraction des données spécifiques
        const { fraisScolarite, classId, schoolId, nom, prenom } = createUserDto;
    
        // 1. Création du User (Auth)
        // Correction: On ne passe que les champs qui existent dans User.entity.ts
        const newUser = queryRunner.manager.create(User, {
            email,
            password: hashedPassword, // Correction du nom de champ
            school: { id: Number(schoolId) },
            role: createUserDto.role,
            isActive: true
        });
    
        const savedUser = await queryRunner.manager.save(newUser);
    
        // 2. Si c'est un élève, on crée le profil Student (Métier)
        if (savedUser.role === UserRole.STUDENT) {
            const newStudent = queryRunner.manager.create(Student, {
                nom: nom,       // On prend du DTO
                prenom: prenom, // On prend du DTO
                userId: savedUser.id, 
                class: classId ? { id: Number(classId) } : undefined, // Correction relation
                school: { id: Number(schoolId) }
            });
            
            const savedStudent = await queryRunner.manager.save(newStudent);
            
            this.eventEmitter.emit('student.created', {
                studentId: savedStudent.id,
                userId: savedUser.id,
                schoolId: savedUser.schoolId ?? 0,
                fraisScolarite: (fraisScolarite && !isNaN(parseFloat(fraisScolarite))) ? parseFloat(fraisScolarite) : 0
            });
        }

        await queryRunner.commitTransaction();
        return { ...savedUser, plainPassword }; // Retourne le MDP clair pour l'affichage initial

    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
  }

  async findAll(): Promise<User[]> { 
      // Correction: Pas de relation 'class' sur User, et pas de champ 'nom'
      return this.usersRepository.find({ 
          order: { email: 'ASC' } 
      }); 
  }

  async findAllBySchool(schoolId: number): Promise<User[]> { 
      // Correction: Suppression de relations: ['class'] qui n'existe pas sur User
      return this.usersRepository.find({ 
          where: { school: { id: schoolId }, role: Not(UserRole.SUPER_ADMIN) }, 
          order: { email: 'ASC' } 
      }); 
  }
  
  async findOneByEmail(email: string): Promise<User | null> { 
      return this.usersRepository.createQueryBuilder("user")
        .where("user.email = :email", { email })
        .addSelect("user.password") // Correction: password, pas passwordHash
        .leftJoinAndSelect("user.school", "school")
        .getOne(); 
  }

  async updateUser(userId: number, data: any, adminSchoolId: number | null) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("Utilisateur introuvable");
    if (adminSchoolId && user.schoolId !== adminSchoolId) throw new ForbiddenException("Modification interdite.");
    
    // Nettoyage des données sensibles ou inexistantes
    delete data.password; 
    delete data.email; 
    delete data.role; 
    delete data.schoolId;
    delete data.classId; // User n'a pas de classId direct
    
    // S'il y a des champs restants valides dans data, on met à jour
    Object.assign(user, data);
    return this.usersRepository.save(user);
  }

  async updatePassword(userId: number, passwordHash: string): Promise<void> { 
      // Correction: Utiliser la clé 'password'
      await this.usersRepository.update(userId, { password: passwordHash }); 
  }

  // Cette fonctionnalité nécessite d'ajouter les colonnes dans l'entité User.
  // Pour l'instant, on laisse vide ou on commente pour éviter le crash.
  async updateNotificationPreferences(userId: number, prefs: any) {
    /* return this.usersRepository.update(userId, { 
        notifGradesEnabled: prefs.notifGradesEnabled, 
        // ...
    });
    */
    return; // Placeholder
  }

  async adminResetPassword(adminSchoolId: number | null, targetUserId: number): Promise<string> {
    const targetUser = await this.usersRepository.findOne({ where: { id: targetUserId } });
    if (!targetUser) throw new NotFoundException("Utilisateur introuvable.");
    
    if (adminSchoolId && targetUser.schoolId !== adminSchoolId) {
        throw new ForbiddenException("Vous ne pouvez pas réinitialiser cet utilisateur.");
    }
    
    const tempPassword = Math.random().toString(36).slice(-6);
    const newHash = await bcrypt.hash(tempPassword, 10);
    
    // Correction: Utiliser 'password'
    await this.usersRepository.update(targetUserId, { password: newHash });
    
    return tempPassword;
  }
}
