import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Student } from '../../students/entities/student.entity';

@Entity()
export class Bulletin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  period: string; // "T1", "T2", "T3"

  @ManyToOne(() => Student)
  student: Student;

  @Column()
  studentId: number;

  @Column('text', { nullable: true })
  appreciation: string; // Le commentaire du conseil de classe

  @Column('float', { nullable: true })
  moyenneGenerale: number; // Stockée pour l'historique

  @Column({ default: false })
  isPublished: boolean; // Pour cacher le bulletin aux parents tant qu'il n'est pas fini
}
