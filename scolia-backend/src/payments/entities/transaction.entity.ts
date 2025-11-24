import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { School } from '../../schools/entities/school.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  mobileMoneyReference: string; // Le code SMS (ex: CI2301...)

  @Column({ default: 'Pending' })
  status: 'Pending' | 'Validated' | 'Rejected';

  @CreateDateColumn()
  transactionDate: Date;
  
  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  studentId: number;
  
  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  schoolId: number;
}
