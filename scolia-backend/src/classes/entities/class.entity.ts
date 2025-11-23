import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Homework } from '../../homeworks/entities/homework.entity';
import { School } from '../../schools/entities/school.entity'; // <--- IMPORT AJOUTÉ

@Entity()
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // ex: "6ème A"

  @Column({ nullable: true })
  level: string; // ex: "6ème"

  // Une classe a plusieurs élèves
  @OneToMany(() => Student, (student) => student.class)
  students: Student[];

  // Une classe a plusieurs devoirs
  @OneToMany(() => Homework, (homework) => homework.class)
  homeworks: Homework[];

  // --- AJOUT MULTI-TENANT ---
  @ManyToOne(() => School, (school) => school.classes, { nullable: true })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number;
}
