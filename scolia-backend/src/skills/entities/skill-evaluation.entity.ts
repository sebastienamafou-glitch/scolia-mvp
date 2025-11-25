import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // L'élève
import { Competence } from './competence.entity';

@Entity()
export class SkillEvaluation {
  @PrimaryGeneratedColumn()
  id: number;

  // Score de 1 à 5 (ou 1 à 10)
  @Column({ type: 'int' })
  level: number; 

  @Column({ type: 'text', nullable: true })
  comment: string; // Appréciation spécifique (ex: "Très bon progrès")

  @CreateDateColumn()
  evaluationDate: Date;

  // Lien vers l'élève
  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  studentId: number;

  // Lien vers la compétence évaluée
  @ManyToOne(() => Competence)
  @JoinColumn({ name: 'competenceId' })
  competence: Competence;

  @Column()
  competenceId: number;

  // Lien vers l'évaluateur (le Prof) - Optionnel mais utile pour la traçabilité
  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @Column()
  teacherId: number;
}
