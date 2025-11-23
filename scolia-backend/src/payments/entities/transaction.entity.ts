import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { School } from '../../schools/entities/school.entity';

export type TransactionStatus = 'Pending' | 'Validated' | 'Rejected';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  mobileMoneyReference: string; // Référence fournie par Orange/MTN/Moov

  @Column({ default: 'Pending' })
  status: TransactionStatus;

  @CreateDateColumn()
  transactionDate: Date;
  
  // Lien vers l'élève concerné
  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  studentId: number;
  
  // L'école est liée pour l'isolation Multi-Tenant
  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  schoolId: number;
}
