import { Injectable, OnModuleInit, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
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
    const hashedPassword = await bcrypt.hash('password', 10);
    const superAdmin = this.usersRepository.create({
        email: `admin@${this.DOMAIN_NAME}`, 
        passwordHash: hashedPassword,
        role: UserRole.SUPER_ADMIN, 
        nom: 'ADMIN',
        prenom: 'System',
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
        if (!email || email.indexOf('@') === -1) {
           email = await this.generateUniqueEmail(createUserDto.prenom, createUserDto.nom);
        } else {
           email = email.toLowerCase();
        }
    
        const plainPassword = this.generateRandomPassword(8);
        const passwordHash = await bcrypt.hash(plainPassword, 10);
    
        const { password, fraisScolarite, classId, schoolId, ...userData } = createUserDto;
    
        const newUser = queryRunner.manager.create(User, {
            ...userData,
            email,
            passwordHash,
            school: { id: Number(schoolId) },
            role: createUserDto.role,
            class: classId ? { id: Number(classId) } : null,
        });
    
        const savedUser = await queryRunner.manager.save(newUser);
    
        if (savedUser.role === UserRole.STUDENT) {
            const newStudent = queryRunner.manager.create(Student, {
                nom: savedUser.nom,
                prenom: savedUser.prenom,
                userId: savedUser.id, 
                class: classId ? { id: Number(classId) } : undefined,
                school: { id: Number(schoolId) } // ✅ Important pour multi-tenant
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
      return this.usersRepository.find({ relations: ['class'], order: { nom: 'ASC' } }); 
  }

  async findAllBySchool(schoolId: number): Promise<User[]> { 
      return this.usersRepository.find({ 
          where: { school: { id: schoolId }, role: Not(UserRole.SUPER_ADMIN) }, 
          relations: ['class'], 
          order: { nom: 'ASC' } 
      }); 
  }
  
  async findOneByEmail(email: string): Promise<User | null> { 
      return this.usersRepository.createQueryBuilder("user")
        .where("user.email = :email", { email })
        .addSelect("user.passwordHash") // On sélectionne explicitement le hash caché
        .leftJoinAndSelect("user.school", "school")
        .getOne(); 
  }

  async updateUser(userId: number, data: any, adminSchoolId: number | null) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("Utilisateur introuvable");
    if (adminSchoolId && user.schoolId !== adminSchoolId) throw new ForbiddenException("Modification interdite.");
    
    if (data.classId) { 
        user.class = { id: Number(data.classId) } as any; 
        delete data.classId; 
    }
    
    delete data.password; delete data.passwordHash; delete data.email; delete data.role; delete data.schoolId;
    Object.assign(user, data);
    return this.usersRepository.save(user);
  }

  async updatePassword(userId: number, passwordHash: string): Promise<void> { 
      // Le service auth envoie déjà le hash
      await this.usersRepository.update(userId, { passwordHash }); 
  }

  async updateNotificationPreferences(userId: number, prefs: any) {
    return this.usersRepository.update(userId, { 
        notifGradesEnabled: prefs.notifGradesEnabled, 
        notifAbsencesEnabled: prefs.notifAbsencesEnabled, 
        notifFinanceEnabled: prefs.notifFinanceEnabled
    });
  }

  async adminResetPassword(adminSchoolId: number | null, targetUserId: number): Promise<string> {
    const targetUser = await this.usersRepository.findOne({ where: { id: targetUserId } });
    if (!targetUser) throw new NotFoundException("Utilisateur introuvable.");
    
    if (adminSchoolId && targetUser.schoolId !== adminSchoolId) {
        throw new ForbiddenException("Vous ne pouvez pas réinitialiser cet utilisateur.");
    }
    
    const tempPassword = Math.random().toString(36).slice(-6);
    const newHash = await bcrypt.hash(tempPassword, 10);
    await this.usersRepository.update(targetUserId, { passwordHash: newHash });
    
    return tempPassword;
  }
}
