// scolia-backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';

// Modules fonctionnels
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SchoolsModule } from './schools/schools.module';
import { ClassesModule } from './classes/classes.module';
import { StudentsModule } from './students/students.module';
import { GradesModule } from './grades/grades.module';
import { AttendanceModule } from './attendance/attendance.module';
import { HomeworksModule } from './homeworks/homeworks.module';
import { PaymentsModule } from './payments/payments.module';
import { NewsModule } from './news/news.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SkillsModule } from './skills/skills.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TimetableModule } from './timetable/timetable.module';
import { ImportModule } from './import/import.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    // 1. Configuration Globale (.env)
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    // 2. Base de Données (PostgreSQL / Neon)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'), // URL complète de Neon
        autoLoadEntities: true,
        synchronize: true, // ⚠️ À mettre à false en prod (utiliser migrations)
        ssl: { rejectUnauthorized: false }, // Nécessaire pour Neon/Render
      }),
    }),

    // 3. Gestion d'événements
    EventEmitterModule.forRoot(),

    // 4. Rate Limiting (Sécurité)
    ThrottlerModule.forRoot([{
        ttl: 60000,
        limit: 100, // Max 100 requêtes/min par IP globalement
    }]),

    // 5. Modules Métier
    AuthModule,
    UsersModule,
    SchoolsModule,
    ClassesModule,
    StudentsModule,
    GradesModule,
    AttendanceModule,
    HomeworksModule,
    PaymentsModule,
    NewsModule,
    NotificationsModule,
    SkillsModule,
    AnalyticsModule,
    TimetableModule,
    ImportModule,
    MailModule
  ],
})
export class AppModule {}
