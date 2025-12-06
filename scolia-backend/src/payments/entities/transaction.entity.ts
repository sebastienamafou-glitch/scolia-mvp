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

  @Column({ 
      type: 'enum', 
      enum: ['Pending', 'Validated', 'Rejected'], 
      default: 'Pending' 
  })
  status: 'Pending' | 'Validated' | 'Rejected';

  @CreateDateColumn()
  transactionDate: Date;
  
  // Le payeur est techniquement un User (Parent ou Élève)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' }) // On garde le nom de colonne 'studentId' pour compatibilité existante
  student: User;

  @Column()
  studentId: number;
  
  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  schoolId: number;
}
