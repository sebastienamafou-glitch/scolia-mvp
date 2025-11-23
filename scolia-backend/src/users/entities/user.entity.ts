import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { School } from '../../schools/entities/school.entity'; // <--- IMPORT AJOUTÉ

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  role: string;

  // --- AJOUT DE LA PHOTO ---
  @Column({ nullable: true }) // nullable: true car la photo n'est pas obligatoire
  photo: string;

  // Champs optionnels
  @Column({ nullable: true })
  nom: string;

  @Column({ nullable: true })
  prenom: string;

  @Column({ nullable: true })
  classe: string;

  @Column({ nullable: true })
  parentId: number;

  // Relation : Un parent a plusieurs enfants (Students)
  @OneToMany(() => Student, (student) => student.parent)
  children: Student[];

  // --- AJOUT MULTI-TENANT ---
  @ManyToOne(() => School, (school) => school.users, { nullable: true }) // nullable au début pour la migration
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number;
}
