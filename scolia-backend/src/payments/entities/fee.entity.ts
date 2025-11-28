import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { School } from '../../schools/entities/school.entity';

@Entity()
export class Fee {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ CORRECTION : Ajout de la colonne manquante
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number; 

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  studentId: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number;
}
