import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity'; // ✅ CHANGEMENT: User -> Student
import { School } from '../../schools/entities/school.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  mobileMoneyReference: string; 

  @Column({ 
      type: 'enum', 
      enum: ['Pending', 'Validated', 'Rejected'], 
      default: 'Pending' 
  })
  status: 'Pending' | 'Validated' | 'Rejected';

  @CreateDateColumn()
  transactionDate: Date;
  
  // ✅ CORRECTION : On lie au dossier Student, pas au compte User générique
  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' }) 
  student: Student;

  @Column()
  studentId: number;
  
  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  schoolId: number;
}
