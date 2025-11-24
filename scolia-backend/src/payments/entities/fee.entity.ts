import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { School } from '../../schools/entities/school.entity';

@Entity()
export class Fee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountDue: number; // Total à payer (ex: 150000)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number; // Total déjà versé

  @Column({ type: 'date' })
  dueDate: Date; // Date limite

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;
  
  @Column()
  studentId: number;

  // Liaison Multi-Tenant indispensable
  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  schoolId: number;
}
