import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Class } from '../../classes/entities/class.entity';
import { Grade } from '../../grades/entities/grade.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column({ nullable: true })
  dateDeNaissance: string;

  @Column({ nullable: true })
  photoUrl: string; // <-- Pour la PHOTO

  // Lien vers le Parent (User)
  @ManyToOne(() => User, (user) => user.children)
  parent: User;

  @Column()
  parentId: number;

  // Lien vers la Classe
  @ManyToOne(() => Class, (classe) => classe.students)
  class: Class;

  @Column({ nullable: true })
  classId: number;

  // Lien vers les Notes
  @OneToMany(() => Grade, (grade) => grade.student)
  grades: Grade[];
}
