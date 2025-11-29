// scolia-backend/src/users/entities/user.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
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

  // --- PROFILS ÉLÈVE ---
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
  // 👇 CORRECTION ICI : AJOUT DE { insert: false, update: false }
  // =========================================================

  // 1. L'École
  @ManyToOne(() => School, (school) => school.users, { nullable: true })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  // On garde la colonne pour lire l'ID facilement, mais on interdit l'écriture directe
  @Column({ nullable: true, insert: false, update: false }) 
  schoolId: number;

  // 2. La Classe
  @ManyToOne(() => Class, (classe) => classe.students, { nullable: true })
  @JoinColumn({ name: 'classId' })
  class: Class;

  // Idem ici
  @Column({ nullable: true, insert: false, update: false }) 
  classId: number;

  // 3. Le Parent
  @Column({ nullable: true })
  parentId: number;
}
