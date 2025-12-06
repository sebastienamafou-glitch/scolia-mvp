import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
// 👇 AJOUT IMPORT
import { Homework } from '../../homeworks/entities/homework.entity';
import { School } from '../../schools/entities/school.entity';

@Entity()
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  level: string;

  @OneToMany(() => Student, (student) => student.class)
  students: Student[];

  // 👇 AJOUT RELATION MANQUANTE
  @OneToMany(() => Homework, (homework) => homework.class)
  homeworks: Homework[];

  @ManyToOne(() => School, (school) => school.classes, { nullable: false })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  schoolId: number;
}
