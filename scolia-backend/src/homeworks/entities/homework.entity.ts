import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { School } from '../../schools/entities/school.entity'; // ✅ Ajout

@Entity()
export class Homework {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string; 

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  matiere: string;

  @Column()
  dueDate: Date; 

  @ManyToOne(() => Class, (classe) => classe.homeworks)
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column()
  classId: number;

  // ✅ SÉCURITÉ : On lie le devoir à l'école pour faciliter le filtrage global
  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number;
}
