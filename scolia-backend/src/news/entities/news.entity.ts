import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { School } from '../../schools/entities/school.entity';
// ✅ IMPORT AJOUTÉ
import { UserRole } from '../../auth/roles.decorator';

// On utilise l'Enum importé pour typer le syndicat de types
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
  targetRole: string; // On stocke en string en base pour simplifier

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  schoolId: number;
}
