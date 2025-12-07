// scolia-backend/src/users/entities/user.entity.ts

import { 
    Entity, 
    Column, 
    PrimaryGeneratedColumn, 
    ManyToOne, 
    OneToMany, 
    JoinColumn, 
    CreateDateColumn, 
    UpdateDateColumn 
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { UserRole } from '../../auth/roles.decorator'; // Assurez-vous que le chemin est bon
import { Notification } from '../../notifications/entities/notification.entity'; // 👈 Import ajouté

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Sera haché via BCrypt [cite: 33]

  @Column({ 
      type: 'enum', 
      enum: UserRole, 
      default: UserRole.STUDENT 
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean; // Pour la suspension d'accès [cite: 47]

  // --- RELATIONS ---

  // Relation Multi-Tenant vers l'École [cite: 29, 100]
  @ManyToOne(() => School, (school) => school.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true }) // Nullable car le SuperAdmin n'a pas forcément d'école
  schoolId: number;

  // 👇 Relation Notifications (Celle que vous vouliez ajouter)
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  // Timestamps automatiques
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
