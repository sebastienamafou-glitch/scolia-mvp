// scolia-backend/src/attendance/entities/attendance.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Architecture V2 : L'élève est un User
import { Class } from '../../classes/entities/class.entity';

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date; // Stocke YYYY-MM-DD (Pour grouper les absences par jour)

  @Column()
  status: string; // Valeurs attendues : 'Présent', 'Absent', 'Retard'

  // --- RELATIONS ---

  // 1. L'Élève concerné
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  studentId: number;

  // 2. La Classe concernée
  @ManyToOne(() => Class, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column()
  classId: number;

  // 3. L'Enseignant qui a fait l'appel (Traçabilité)
  // Optionnel, car l'appel peut être fait par un admin
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @Column({ nullable: true })
  teacherId: number;

  @CreateDateColumn()
  createdAt: Date; // Heure exacte de la saisie
}
