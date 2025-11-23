import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Class } from '../../classes/entities/class.entity';

@Entity()
export class School {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Ex: "Collège Victor Hugo"

  @Column({ nullable: true })
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  // Une école a plusieurs utilisateurs (Profs, Admins, Elèves)
  @OneToMany(() => User, (user) => user.school)
  users: User[];

  // Une école a plusieurs classes
  @OneToMany(() => Class, (classe) => classe.school)
  classes: Class[];
}
