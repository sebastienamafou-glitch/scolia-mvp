import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { School } from '../../schools/entities/school.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  // ✅ AJOUT POUR CORRIGER L'ERREUR DE NOTIFICATION
  @Column({ nullable: true })
  fcmToken: string;

  @Column({ nullable: true })
  passwordHash: string; 

  @Column({ nullable: true }) // Gardé pour compatibilité
  password: string;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  photo: string;

  // --- CHAMPS NOUVEAUX (Pour corriger les erreurs) ---
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
  // ---------------------------------------------------

  // ✅ CONTRÔLE DES NOTIFICATIONS (Opt-out par catégorie)
  @Column({ default: true }) // Par défaut, activé
  notifGradesEnabled: boolean;

  @Column({ default: true })
  notifAbsencesEnabled: boolean;

  @Column({ default: true })
  notifFinanceEnabled: boolean;

  // ✅ PÉRIODE DE SILENCE (Gestion du "Ne pas déranger")
  @Column({ type: 'jsonb', nullable: true }) // Stocke { start: "22:00", end: "07:00" } sous forme de chaîne JSON
  notifQuietHours: string;  
  
  // --- RELATIONS ---
  @ManyToOne(() => School, (school) => school.users, { nullable: true })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number;

  @Column({ nullable: true })
  classe: string;

  @Column({ nullable: true })
  parentId: number;
}
