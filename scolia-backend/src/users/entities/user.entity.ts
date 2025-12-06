import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { Class } from '../../classes/entities/class.entity';
import { UserRole } from '../../auth/roles.decorator';
// 👇 AJOUT IMPORT (Attention au chemin relatif, il faut peut-être ajuster selon ton dossier)
import { Notification } from '../../notifications/entities/notification.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  fcmToken: string;

  @Column({ select: false }) 
  passwordHash: string; 

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column({
      type: 'enum',
      enum: UserRole,
      default: UserRole.STUDENT
  })
  role: UserRole;

  @Column({ nullable: true })
  photo: string;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true, type: 'timestamp' })
  resetTokenExp: Date;

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

  @Column({ default: true })
  notifGradesEnabled: boolean;

  @Column({ default: true })
  notifAbsencesEnabled: boolean;

  @Column({ default: true })
  notifFinanceEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  notifQuietHours: string;

  // --- RELATIONS EXISTANTES ---
  @ManyToOne(() => School, (school) => school.users, { nullable: true })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number;

  @ManyToOne(() => Class, (classe) => classe.students, { nullable: true })
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column({ nullable: true })
  classId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: User;

  @Column({ nullable: true })
  parentId: number;

  // 👇 AJOUT RELATION MANQUANTE
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
