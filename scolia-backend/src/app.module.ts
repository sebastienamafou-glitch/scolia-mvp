// scolia-backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// --- 1. IMPORT DES ENTITÉS ---
import { User } from './users/entities/user.entity';
import { Student } from './students/entities/student.entity';
import { Class } from './classes/entities/class.entity';
import { Grade } from './grades/entities/grade.entity';
import { Homework } from './homeworks/entities/homework.entity';
// Ajout des nouvelles entités :
import { Bulletin } from './grades/entities/bulletin.entity'; 
import { News } from './news/entities/news.entity';

// --- 2. IMPORT DES MODULES ---
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { ClassesModule } from './classes/classes.module';
import { GradesModule } from './grades/grades.module';
import { HomeworksModule } from './homeworks/homeworks.module';
// Ajout du module News :
import { NewsModule } from './news/news.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: 5432,
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        ssl: true, // Requis pour Render/Neon en prod
        // AJOUT DE Bulletin ET News DANS LA LISTE :
        entities: [User, Student, Class, Grade, Homework, Bulletin, News], 
        synchronize: true, 
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    StudentsModule,
    ClassesModule,
    GradesModule,
    HomeworksModule,
    NewsModule, // <--- Ne pas oublier d'ajouter le module ici
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
