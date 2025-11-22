import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Homework } from '../../homeworks/entities/homework.entity';

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
}
