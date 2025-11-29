// scolia-backend/src/users/entities/user.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { Class } from '../../classes/entities/class.entity'; // 👈 Import de la Classe

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  fcmToken: string;

  @Column({ nullable: true, select: false }) // Select: false pour ne pas renvoyer le hash par défaut
  passwordHash: string; 

  @Column({ nullable: true })
  password: string; // Temporaire pour l'affichage à la création

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

  // --- PROFILS ÉLÈVE (Infos détaillées) ---
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
  // RELATIONS STRUCTURELLES (LA CORRECTION V2)
  // =========================================================

  // 1. L'École (Multi-Tenant)
  @ManyToOne(() => School, (school) => school.users, { nullable: true })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number;

  // 2. La Classe (Architecture Propre)
  // Remplace l'ancien champ texte 'classe'
  @ManyToOne(() => Class, (classe) => classe.students, { nullable: true })
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column({ nullable: true })
  classId: number;

  // 3. Le Parent (Lien Familial)
  @Column({ nullable: true })
  parentId: number;
}
