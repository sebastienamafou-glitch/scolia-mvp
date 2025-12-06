import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { School } from '../../schools/entities/school.entity';

@Entity()
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  matiere: string; // 👈 Indispensable

  @Column('float')
  value: number; 

  @Column({ default: 20 })
  sur: number; // 👈 Indispensable

  @Column({ default: 1 })
  coef: number; // 👈 Indispensable

  @Column()
  type: string; 

  @Column({ default: 'T1' }) 
  period: string; 

  @Column()
  date: Date;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: number;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number;
}
