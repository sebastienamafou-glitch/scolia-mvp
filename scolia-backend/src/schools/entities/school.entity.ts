import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Class } from '../../classes/entities/class.entity';

// Interface pour le typage fort dans le code
export interface SchoolModules {
    cards: boolean;       // Génération de Cartes
    sms: boolean;         // Pack SMS/WhatsApp
    ai_planning: boolean; // Emploi du temps IA
    risk_radar: boolean;  // Analyse prédictive
}

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

  @Column({ nullable: true, type: 'text' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: true })
  isActive: boolean;

  // ✅ NOUVEAU : Configuration des modules activés
  // 'jsonb' est spécifique à Postgres (parfait pour Neon)
  @Column({ type: 'jsonb', default: { cards: false, sms: false, ai_planning: false, risk_radar: false } })
  modules: SchoolModules;

  @OneToMany(() => User, (user) => user.school)
  users: User[];

  @OneToMany(() => Class, (classe) => classe.school)
  classes: Class[];
}
