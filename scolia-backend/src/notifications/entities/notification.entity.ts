import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column("text")
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // --- AJOUTS NÉCESSAIRES ---
  
  @Column()
  userId: number; // Cette ligne va corriger l'erreur "userId does not exist"

  @Column({ nullable: true })
  schoolId: number; // Cette ligne va corriger l'erreur "schoolId does not exist"

  // Relation optionnelle (utile pour les jointures plus tard)
  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) 
  user: User;
}
