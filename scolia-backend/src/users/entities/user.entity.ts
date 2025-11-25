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

  // --- INFOS COMPLÉMENTAIRES ÉLÈVE ---
  @Column({ nullable: true, type: 'date' }) // Date
  dateNaissance: string;

  @Column({ nullable: true })
  adresse: string;

  @Column({ nullable: true })
  contactUrgenceNom: string;

  @Column({ nullable: true })
  contactUrgenceTel: string;

  @Column({ nullable: true, type: 'text' })
  infosMedicales: string;
  // ------------------------------------

  @ManyToOne(() => School, (school) => school.users, { nullable: true })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number | null;

  @Column({ nullable: true })
  fcmToken: string;

  @Column({ nullable: true })
  classe: string;

  @Column({ nullable: true })
  parentId: number;
}
