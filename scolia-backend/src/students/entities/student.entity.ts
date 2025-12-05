import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Class } from '../../classes/entities/class.entity';
import { Grade } from '../../grades/entities/grade.entity';
import { School } from '../../schools/entities/school.entity'; // 👈 Import Ajouté

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  // --- CHAMPS D'INFORMATION ---
  
  @Column({ type: 'date', nullable: true })
  dateNaissance: Date; // ✅ Le champ que le front cherche désespérément

  @Column({ nullable: true })
  adresse: string;

  @Column({ nullable: true })
  telephoneEleve: string;

  @Column({ nullable: true })
  contactUrgenceNom: string;

  @Column({ nullable: true })
  contactUrgenceTel: string;

  @Column({ type: 'text', nullable: true })
  infosMedicales: string;

  // --------------------------------------

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: number;

  // --------------------------------------

  @ManyToOne(() => Class, (classe) => classe.students)
  class: Class;

  @ManyToOne(() => User) // Relation vers le Parent
  @JoinColumn({ name: 'parentId' })
  parent: User;
  
  @Column({ nullable: true })
  parentId: number;

  @OneToMany(() => Grade, (grade) => grade.student)
  grades: Grade[];

  @Column({ nullable: true }) 
  photo: string;

  // ✅ CORRECTION : Ajout de la relation School manquante
  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number;
}
