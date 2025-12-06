// scolia-backend/src/news/entities/news.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { School } from '../../schools/entities/school.entity'; // 👈 Import

export type TargetAudience = 'All' | UserRole.TEACHER | UserRole.PARENT | UserRole.STUDENT;

@Entity()
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ default: 'All' })
  targetRole: TargetAudience;

  @Column({ default: false })
  isUrgent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // ✅ SÉCURITÉ : Liaison avec l'école
  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  schoolId: number;
}
