import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Class } from '../../classes/entities/class.entity';
import { Grade } from '../../grades/entities/grade.entity';
import { School } from '../../schools/entities/school.entity'; // 👈 Import School

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
  dateNaissance: Date; // ✅ C'est ce champ que le Frontend cherche !

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

  @Column({ nullable: true }) // nullable: true car certains n'ont pas encore de photo
  photo: string;

  // --- RELATIONS ---

  // Lien vers le compte Login (User)
  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => Class, (classe) => classe.students)
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column({ nullable: true })
  classId: number;

  // Lien avec le compte Parent (User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'parentId' })
  parent: User;

  @Column({ nullable: true })
  parentId: number;

  @OneToMany(() => Grade, (grade) => grade.student)
  grades: Grade[];

  // ✅ AJOUT : Relation School indispensable pour le multi-tenant
  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number;
}
