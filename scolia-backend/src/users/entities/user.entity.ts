import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { School } from '../../schools/entities/school.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  // --- AJOUTEZ CES DEUX COLONNES ---
  @Column({ nullable: true }) 
  password: string; // Pour l'ancien mot de passe en clair (migration)

  @Column({ nullable: true }) 
  passwordHash: string; // Pour le nouveau mot de passe crypté (sécurité)
  // --------------------------------

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  photo: string;

  @ManyToOne(() => School, (school) => school.users, { nullable: true })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number | null; // 💡 CORRECTION : Ajouter | null ici

  // ... (supprimez 'classe' et 'parentId' s'ils sont encore là, 
  // car nous gérons cela via Student maintenant, ou gardez-les si vous les utilisez encore pour l'affichage)
  @Column({ nullable: true })
  classe: string;

  @Column({ nullable: true })
  parentId: number;
}
