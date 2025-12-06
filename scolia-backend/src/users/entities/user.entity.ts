import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { Class } from '../../classes/entities/class.entity';
import { UserRole } from '../../auth/roles.decorator'; // Assurez-vous que le chemin est bon

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  fcmToken: string;

  @Column({ nullable: true, select: false }) 
  passwordHash: string; 

  @Column({ nullable: true })
  password: string;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  // ✅ CORRECTION : Utilisation de l'Enum
  @Column({
      type: 'enum',
      enum: UserRole,
      default: UserRole.STUDENT
  })
  role: UserRole;

  @Column({ nullable: true })
  photo: string;

  // --- CHAMPS RESET PASSWORD ---
  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true, type: 'timestamp' })
  resetTokenExp: Date;

  // --- PROFILS ÉLÈVE & INFOS ---
  @Column({ nullable: true })
  dateNaissance: string;

  @Column({ nullable: true })
  adresse: string;

  @Column({ nullable: true })
  contactUrgenceNom: string;

  @Column({ nullable: true })
  contactUrgenceTel: string;

  @Column({ nullable: true, type: 'text' })
  infosMedicales: string;

  // --- PRÉFÉRENCES NOTIFICATIONS ---
  @Column({ default: true })
  notifGradesEnabled: boolean;

  @Column({ default: true })
  notifAbsencesEnabled: boolean;

  @Column({ default: true })
  notifFinanceEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  notifQuietHours: string;

  // =========================================================
  // RELATIONS
  // =========================================================

  @ManyToOne(() => School, (school) => school.users, { nullable: true })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @RelationId((user: User) => user.school)
  schoolId: number;

  @ManyToOne(() => Class, (classe) => classe.students, { nullable: true })
  @JoinColumn({ name: 'classId' })
  class: Class;

  @RelationId((user: User) => user.class)
  classId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: User;

  @RelationId((user: User) => user.parent)
  parentId: number;
}
