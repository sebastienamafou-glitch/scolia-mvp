import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { School } from '../../schools/entities/school.entity';

@Entity()
export class Bulletin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  period: string; // "T1", "T2", "T3"

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: number;
  
  // ✅ Relation School (Pour le cloisonnement)
  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number;

  @Column('text', { nullable: true })
  appreciation: string; 

  @Column('float', { nullable: true })
  moyenneGenerale: number; 

  @Column({ default: false })
  isPublished: boolean; 
}
