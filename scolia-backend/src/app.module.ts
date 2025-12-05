// scolia-backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter'; // 👈 NOUVEAU
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; 
import { APP_GUARD } from '@nestjs/core'; 
import { BulletinsModule } from './bulletins/bulletins.module'; // 👈 Importez-le
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import des Entités
import { User } from './users/entities/user.entity';
import { Student } from './students/entities/student.entity';
import { Class } from './classes/entities/class.entity';
import { Grade } from './grades/entities/grade.entity';
import { Homework } from './homeworks/entities/homework.entity';
import { Bulletin } from './grades/entities/bulletin.entity'; 
import { News } from './news/entities/news.entity';
import { School } from './schools/entities/school.entity';
import { Fee } from './payments/entities/fee.entity';
import { Transaction } from './payments/entities/transaction.entity';
import { Competence } from './skills/entities/competence.entity';
import { SkillEvaluation } from './skills/entities/skill-evaluation.entity';
import { TimetableEvent } from './timetable/entities/timetable-event.entity'; 
import { Attendance } from './attendance/entities/attendance.entity';
import { Notification } from './notifications/entities/notification.entity';

// Import des Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { ClassesModule } from './classes/classes.module';
import { GradesModule } from './grades/grades.module';
import { HomeworksModule } from './homeworks/homeworks.module';
import { NewsModule } from './news/news.module';
import { SchoolsModule } from './schools/schools.module'; 
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module'; 
import { TimetableModule } from './timetable/timetable.module';
import { SkillsModule } from './skills/skills.module';
import { AttendanceModule } from './attendance/attendance.module'; 
import { ImportModule } from './import/import.module'; 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // ✅ Activation des événements globauxs
    EventEmitterModule.forRoot(),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT') || 5432, 
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, 
        entities: [
            User, Student, Class, Grade, Homework, Bulletin, News, School, 
            Fee, Transaction, Competence, SkillEvaluation, TimetableEvent,
            Attendance, Notification
        ],
        synchronize: false, // Mettre à true UNE SEULE FOIS pour créer les tables
      }),
      inject: [ConfigService],
    }),

    ThrottlerModule.forRoot([{
        ttl: 60000, 
        limit: 100,
    }]),

    AuthModule,
    UsersModule,
    StudentsModule,
    ClassesModule,
    GradesModule,
    HomeworksModule,
    NewsModule,
    SchoolsModule,
    PaymentsModule,
    NotificationsModule, 
    SkillsModule,
    AnalyticsModule, 
    TimetableModule,
    AttendanceModule,
    ImportModule,
    BulletinsModule, // 👈 Ajoutez-le dans la liste imports

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}
