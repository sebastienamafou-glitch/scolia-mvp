import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Class } from '../../classes/entities/class.entity';

@Entity()
export class Homework {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string; // ex: "Exercice page 42"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  matiere: string;

  @Column()
  dueDate: Date; // Pour quand ?

  // Lien vers la Classe (tout le monde a le même devoir)
  @ManyToOne(() => Class, (classe) => classe.homeworks)
  class: Class;

  @Column()
  classId: number;
}
