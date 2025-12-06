import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity'; // ✅ CHANGEMENT: User -> Student
import { User } from '../../users/entities/user.entity'; // Utilisé pour 'teacher'
import { Competence } from './competence.entity';

@Entity()
export class SkillEvaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  level: number; 

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  evaluationDate: Date;

  // ✅ CORRECTION : On lie au dossier Student pour cohérence globale
  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: number;

  @ManyToOne(() => Competence)
  @JoinColumn({ name: 'competenceId' })
  competence: Competence;

  @Column()
  competenceId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @Column()
  teacherId: number;
}
