import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { School } from '../../schools/entities/school.entity'; // 👈 NOUVEL IMPORT

@Entity()
export class Fee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountDue: number; 

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'date' })
  dueDate: Date;

  // Lien vers l'élève
  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;
  
  @Column()
  studentId: number;

  // --- AJOUT MULTI-TENANT MANQUANT ---
  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  schoolId: number;
  // ------------------------------------
}
