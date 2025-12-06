import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { School } from '../../schools/entities/school.entity'; // ✅ Import Ajouté

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

  @Column({ default: 'T1' }) 
  period: string; 

  @Column({ type: 'float', nullable: true, default: 1 })
  coef: number; 

  @Column()
  date: Date;

  @ManyToOne(() => Student, (student) => student.grades)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: number;

  // ✅ CORRECTION : Relation School indispensable pour filtrer les notes par école
  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number;
}
