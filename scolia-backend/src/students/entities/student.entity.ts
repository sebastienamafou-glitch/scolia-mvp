import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Class } from '../../classes/entities/class.entity';
import { Grade } from '../../grades/entities/grade.entity';
import { School } from '../../schools/entities/school.entity';

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
  dateNaissance: Date;

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
  // Relation OneToOne avec le compte utilisateur de l'élève (Login)
  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: number;

  // --------------------------------------

  @ManyToOne(() => Class, (classe) => classe.students, { nullable: true })
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column({ nullable: true })
  classId: number;

  // Relation vers le Parent (Compte User du parent)
  @ManyToOne(() => User) 
  @JoinColumn({ name: 'parentId' })
  parent: User;
  
  @Column({ nullable: true })
  parentId: number;

  @OneToMany(() => Grade, (grade) => grade.student)
  grades: Grade[];

  @Column({ nullable: true }) 
  photo: string;

  // Relation School (Indispensable pour le multi-tenant)
  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number;
}
