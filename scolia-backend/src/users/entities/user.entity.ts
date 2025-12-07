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
import { UserRole } from '../../auth/roles.decorator';
import { Notification } from '../../notifications/entities/notification.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Le champ s'appelle bien 'password'

  @Column({ 
      type: 'enum', 
      enum: UserRole, 
      default: UserRole.STUDENT 
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  // 👇 AJOUT POUR CORRIGER L'ERREUR NOTIFICATION
  @Column({ nullable: true })
  fcmToken: string; 

  // --- RELATIONS ---

  @ManyToOne(() => School, (school) => school.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId: number;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
