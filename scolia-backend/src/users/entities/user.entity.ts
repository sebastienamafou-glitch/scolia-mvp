// scolia-backend/src/users/entities/user.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { Class } from '../../classes/entities/class.entity';

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

  @Column()
  role: string;

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
  // RELATIONS & IDs (Version @RelationId)
  // =========================================================

  // 1. L'École
  @ManyToOne(() => School, (school) => school.users, { nullable: true })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  // Miroir automatique de l'ID (Lecture seule, géré par TypeORM)
  @RelationId((user: User) => user.school)
  schoolId: number;

  // 2. La Classe
  @ManyToOne(() => Class, (classe) => classe.students, { nullable: true })
  @JoinColumn({ name: 'classId' })
  class: Class;

  // Miroir automatique de l'ID
  @RelationId((user: User) => user.class)
  classId: number;

  // 3. Le Parent (CORRECTION ICI)
  // Relation ManyToOne vers User lui-même (Un élève a un parent qui est aussi un User)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: User;

  // Miroir automatique de l'ID
  @RelationId((user: User) => user.parent)
  parentId: number;
}
