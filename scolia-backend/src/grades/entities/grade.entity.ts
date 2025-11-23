import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Student } from '../../students/entities/student.entity';

@Entity()
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  matiere: string; 

  @Column('float')
  value: number; 

  @Column()
  sur: number; 

  @Column()
  type: string; 

  // AJOUT : Trimestre (par défaut 'T1' pour ne pas casser les données existantes)
  @Column({ default: 'T1' }) 
  period: string; 

  @Column({ type: 'float', nullable: true, default: 1 })
  coef: number; // J'ai mis un défaut à 1 pour faciliter les calculs

  @Column()
  date: Date;

  @ManyToOne(() => Student, (student) => student.grades)
  student: Student;

  @Column()
  studentId: number;
}
