// scolia-backend/src/users/entities/user.entity.ts

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity() // Ceci dit à TypeORM : "Crée une table 'user' dans Postgres"
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column() // 'Parent', 'Enseignant', 'Admin', 'Élève'
  role: string;

  // Champs optionnels (pour les élèves/profs)
  @Column({ nullable: true })
  nom: string;

  @Column({ nullable: true })
  prenom: string;

  @Column({ nullable: true })
  classe: string; // ex: "6ème A"

  @Column({ nullable: true })
  parentId: number; // Pour lier un élève à son parent
}
