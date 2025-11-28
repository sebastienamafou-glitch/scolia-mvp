// scolia-backend/src/app.module.ts

import { SkillsModule } from './skills/skills.module'; 
import { Competence } from './skills/entities/competence.entity';
import { SkillEvaluation } from './skills/entities/skill-evaluation.entity';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; 
import { APP_GUARD } from '@nestjs/core'; 

// --- 1. IMPORT DES ENTITÉS ---
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

// --- 2. IMPORT DES MODULES ---
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT') || 5432, 
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        
        // SSL obligatoire pour la production (Neon/Render)
        ssl: process.env.NODE_ENV === 'production' 
             ? { rejectUnauthorized: false } 
             : false, 

        entities: [User, Student, Class, Grade, Homework, Bulletin, News, School, Fee, Transaction, Competence, SkillEvaluation],
        synchronize: true, // ⚠️ À passer à false et utiliser les migrations une fois stable en prod
      }),
      inject: [ConfigService],
    }),

    // ✅ CONFIGURATION RATE LIMITING ADAPTÉE À LA PRODUCTION
    ThrottlerModule.forRoot([{
        ttl: 60000, // 60 secondes
        limit: 100,  // 100 requêtes par minute (Suffisant pour un usage normal, bloquant pour les bots)
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Appliquer le Guard de Rate Limiting globalement
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}
