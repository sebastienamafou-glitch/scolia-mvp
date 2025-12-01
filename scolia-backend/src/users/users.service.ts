import { Injectable, OnModuleInit, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm'; 
import { User } from './entities/user.entity'; 
import { Student } from '../students/entities/student.entity'; 
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter'; // 👈 Import Event

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  private readonly DOMAIN_NAME = 'scolia.ci';

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    private eventEmitter: EventEmitter2, // 👈 Injection de l'émetteur
  ) {}

  async onModuleInit() {
    await this.seedUsers();
  }

  // ... (Méthodes seedUsers, generateRandomPassword, sanitizeString, generateUniqueEmail inchangées) ...
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
    if (counter >= 100) throw new BadRequestException("Impossible de générer un email unique.");
    return candidateEmail;
  }
  // ... (Fin des méthodes utilitaires) ...

  async create(createUserDto: any): Promise<any> {
    let email = createUserDto.email;
    if (!email || email.indexOf('@') === -1) {
       email = await this.generateUniqueEmail(createUserDto.prenom, createUserDto.nom);
    }

    const plainPassword = this.generateRandomPassword(8);
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const { password, fraisScolarite, classId, schoolId, ...userData } = createUserDto;

    const newUser = this.usersRepository.create({
        ...userData,
        email,
        passwordHash,
        school: { id: Number(schoolId) },
        role: createUserDto.role
    });

    const savedUser = (await this.usersRepository.save(newUser)) as unknown as User;

    if (savedUser.role === 'Élève') {
        try {
            const newStudent = this.studentsRepository.create({
                nom: savedUser.nom,
                prenom: savedUser.prenom,
                userId: savedUser.id, 
                class: classId ? { id: Number(classId) } : undefined,
            });
            
            const savedStudent = await this.studentsRepository.save(newStudent);
            this.logger.log(`✅ Profil Étudiant créé (ID: ${savedStudent.id})`);

            // 📢 ÉMISSION DE L'ÉVÉNEMENT (Découplage total)
            this.eventEmitter.emit('student.created', {
                studentId: savedStudent.id,
                userId: savedUser.id,
                schoolId: savedUser.schoolId ?? 0,
                fraisScolarite: fraisScolarite ? Number(fraisScolarite) : undefined
            });

        } catch (e) { 
            this.logger.error("Erreur critique création profil élève", e);
        }
    }

    return { ...savedUser, plainPassword };
  }

  // --- LECTURE & MISE A JOUR (Identique au fichier précédent, je ne les répète pas pour gagner de la place, gardez les vôtres) ---
  // (Copiez ici findAll, findAllBySchool, findOneByEmail, findStudentsByParentId, findOneById, updateUser, updatePassword, updateResetToken, updateNotificationPreferences, adminResetPassword)
  
  async findAll(): Promise<User[]> { return this.usersRepository.find({ relations: ['class'], order: { nom: 'ASC', prenom: 'ASC' } }); }
  async findAllBySchool(schoolId: number): Promise<User[]> { return this.usersRepository.find({ where: { school: { id: schoolId }, role: Not('SuperAdmin') }, relations: ['class'], order: { nom: 'ASC', prenom: 'ASC' } }); }
  async findOneByEmail(email: string): Promise<User | null> { return this.usersRepository.createQueryBuilder("user").where("user.email = :email", { email }).addSelect("user.passwordHash").leftJoinAndSelect("user.school", "school").getOne(); }
  async findStudentsByParentId(parentId: number): Promise<User[]> { return this.usersRepository.find({ where: { role: 'Élève', parentId }, relations: ['class'] }); }
  async findOneById(id: number): Promise<User | null> { return this.usersRepository.findOne({ where: { id }, relations: ['class', 'school'] }); }
  
  async updateUser(userId: number, data: any, adminSchoolId: number | null) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("Utilisateur introuvable");
    if (adminSchoolId && user.schoolId !== adminSchoolId) throw new ForbiddenException("Modification interdite.");
    if (data.classId) { user.class = { id: Number(data.classId) } as any; delete data.classId; }
    delete data.password; delete data.passwordHash; delete data.email; delete data.role; delete data.schoolId;
    Object.assign(user, data);
    return this.usersRepository.save(user);
  }
  async updatePassword(userId: number, plainPassword: string): Promise<void> { const newHash = await bcrypt.hash(plainPassword, 10); await this.usersRepository.update(userId, { passwordHash: newHash }); }
  async updateResetToken(userId: number, token: string, exp: Date) { return this.usersRepository.update(userId, { resetToken: token, resetTokenExp: exp }); }
  async updateNotificationPreferences(userId: number, prefs: any) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    Object.assign(user, { notifGradesEnabled: prefs.notifGradesEnabled, notifAbsencesEnabled: prefs.notifAbsencesEnabled, notifFinanceEnabled: prefs.notifFinanceEnabled, notifQuietHours: prefs.notifQuietHours ? JSON.stringify(prefs.notifQuietHours) : null });
    return this.usersRepository.save(user);
  }
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
