import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Student } from '../../students/entities/student.entity';

@Entity()
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  matiere: string; // ex: "Mathématiques"

  @Column('float')
  value: number; // La note (ex: 15.5)

  @Column()
  sur: number; // ex: 20

  @Column()
  type: string; // ex: "Devoir", "Interro", "Orale"

  @Column({ nullable: true })
  coef: number;

  @Column()
  date: Date;

  // Lien vers l'élève
  @ManyToOne(() => Student, (student) => student.grades)
  student: Student;

  @Column()
  studentId: number;
}
