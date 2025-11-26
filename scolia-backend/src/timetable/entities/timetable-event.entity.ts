import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { User } from '../../users/entities/user.entity'; 
import { School } from '../../schools/entities/school.entity';

@Entity()
export class TimetableEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dayOfWeek: string; // Lundi, Mardi...

  @Column()
  startTime: string; 

  @Column()
  endTime: string;   

  @Column()
  subject: string;   

  @Column({ nullable: true })
  room: string;      

  // Relations
  @ManyToOne(() => Class, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column()
  classId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @Column({ nullable: true })
  teacherId: number | null; 

  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  schoolId: number;
}
