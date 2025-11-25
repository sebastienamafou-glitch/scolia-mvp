import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { School } from '../../schools/entities/school.entity';

@Entity()
export class Competence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Ex: "Esprit d'équipe", "Logique Mathématique"

  @Column()
  category: string; // Ex: "Soft Skills", "Sciences", "Langues"

  @Column({ type: 'text', nullable: true })
  description: string; // Ex: "Capacité à travailler avec les autres..."

  // Multi-Tenant : Chaque école définit ses propres compétences
  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  schoolId: number;
}
