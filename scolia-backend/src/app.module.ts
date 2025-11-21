// scolia-backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// Vos modules existants
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClassesModule } from './classes/classes.module';
import { StudentsModule } from './students/students.module';
import { NotesModule } from './notes/notes.module';
import { AttendanceModule } from './attendance/attendance.module';
import { NewsModule } from './news/news.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    // 1. Configuration des variables d'environnement (.env)
    ConfigModule.forRoot({
      isGlobal: true, // Accessible partout
    }),

    // 2. Connexion à la Base de Données (PostgreSQL via Neon)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        ssl: true, // Important pour Neon (Cloud)
        autoLoadEntities: true, // Charge automatiquement vos tables
        synchronize: true, // ⚠️ CRITIQUE : Crée les tables automatiquement (Parfait pour le Dev, à désactiver en Prod)
      }),
      inject: [ConfigService],
    }),

    // Vos modules métier
    AuthModule,
    UsersModule,
    ClassesModule,
    StudentsModule,
    NotesModule,
    AttendanceModule,
    NewsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
