import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Class } from '../../classes/entities/class.entity';
import { Grade } from '../../grades/entities/grade.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  // --- NOUVEAUX CHAMPS D'INFORMATION ---
  
  @Column({ type: 'date', nullable: true })
  dateNaissance: Date;

  @Column({ nullable: true })
  adresse: string;

  @Column({ nullable: true })
  telephoneEleve: string;

  // Infos Urgence
  @Column({ nullable: true })
  contactUrgenceNom: string; // Ex: "Grand-mère" ou "Voisin"

  @Column({ nullable: true })
  contactUrgenceTel: string;

  // Infos Santé
  @Column({ type: 'text', nullable: true })
  infosMedicales: string; // Ex: "Allergique aux arachides, Asthmatique"

  // --------------------------------------

  // ✅ CRUCIAL : Lien One-to-One vers le User (Login)
  // C'est ce lien qui permet de dire "L'utilisateur ID 11 est l'étudiant ID 5"
  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: number;

  // --------------------------------------

  @ManyToOne(() => Class, (classe) => classe.students, { eager: true }) // Eager charge la classe auto
  class: Class;

  // Lien avec le compte Parent (User)
  @ManyToOne(() => User, { nullable: true, eager: true }) // Eager charge le parent auto
  parent: User;

  @OneToMany(() => Grade, (grade) => grade.student)
  grades: Grade[];

  @Column({ nullable: true }) // nullable: true car certains n'ont pas encore de photo
  photo: string;
}
