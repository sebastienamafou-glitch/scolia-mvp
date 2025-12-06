import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, RelationId } from 'typeorm';
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

  // --- RELATIONS ---
  
  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) 
  user: User;

  // Cette colonne sera automatiquement remplie par TypeORM grâce à la relation ci-dessus
  @Column()
  userId: number;

  // L'école est stockée directement pour simplifier le filtrage multi-tenant
  @Column({ nullable: true })
  schoolId: number; 
}
