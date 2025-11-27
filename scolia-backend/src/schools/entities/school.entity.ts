// scolia-backend/src/schools/entities/school.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Class } from '../../classes/entities/class.entity';

@Entity()
export class School {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  logo: string; 

  // 👇 AJOUT : Description optionnelle pour la page de l'école
  @Column({ nullable: true, type: 'text' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => User, (user) => user.school)
  users: User[];

  @OneToMany(() => Class, (classe) => classe.school)
  classes: Class[];
}
