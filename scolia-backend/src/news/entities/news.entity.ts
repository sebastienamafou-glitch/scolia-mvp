import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export type TargetAudience = 'All' | 'Enseignant' | 'Parent' | 'Élève';

@Entity()
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  // Qui doit voir ce message ?
  @Column({ default: 'All' })
  targetRole: TargetAudience;

  @Column({ default: false })
  isUrgent: boolean; // Pour afficher en rouge si important

  @CreateDateColumn()
  createdAt: Date;
}
