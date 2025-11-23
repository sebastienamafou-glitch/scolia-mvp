import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'; // <--- OneToMany ajouté ici
import { Student } from '../../students/entities/student.entity';

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
}
