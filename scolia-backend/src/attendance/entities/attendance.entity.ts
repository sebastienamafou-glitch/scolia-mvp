// scolia-backend/src/attendance/entities/attendance.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity'; // ✅ Cohérence avec Grades/Payments
import { Class } from '../../classes/entities/class.entity';
import { User } from '../../users/entities/user.entity';
import { School } from '../../schools/entities/school.entity';

export enum AttendanceStatus {
  PRESENT = 'Présent',
  ABSENT = 'Absent',
  RETARD = 'Retard'
}

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date; 

  @Column({
      type: 'enum',
      enum: AttendanceStatus,
      default: AttendanceStatus.PRESENT
  })
  status: AttendanceStatus; 

  // --- RELATIONS ---

  // 1. L'Élève (On utilise l'entité Student pour la cohérence académique)
  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: number;

  // 2. La Classe
  @ManyToOne(() => Class, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column()
  classId: number;

  // 3. L'auteur de l'appel (User : Prof ou Surveillant)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @Column({ nullable: true })
  teacherId: number;

  // 4. ✅ SÉCURITÉ : Relation École obligatoire
  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number;

  @CreateDateColumn()
  createdAt: Date; 
}
