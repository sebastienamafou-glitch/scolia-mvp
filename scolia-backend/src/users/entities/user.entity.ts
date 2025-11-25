import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { School } from '../../schools/entities/school.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true }) 
  password: string;

  @Column({ nullable: true }) 
  passwordHash: string;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  photo: string;

  // --- CONFIGURATION MULTI-TENANT ---
  @ManyToOne(() => School, (school) => school.users, { nullable: true })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number | null; // Null pour le SuperAdmin

  // --- CONFIGURATION NOTIFICATIONS ---
  @Column({ nullable: true })
  fcmToken: string; // ✅ Le jeton Firebase pour les notifications Push

  // Champs hérités (optionnels selon votre usage actuel)
  @Column({ nullable: true })
  classe: string;

  @Column({ nullable: true })
  parentId: number;
}
