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
import { Bulletin } from './grades/entities/bulletin.entity'; 
import { News } from './news/entities/news.entity';
import { School } from './schools/entities/school.entity';

// --- 2. IMPORT DES MODULES ---
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { ClassesModule } from './classes/classes.module';
import { GradesModule } from './grades/grades.module';
import { HomeworksModule } from './homeworks/homeworks.module';
import { NewsModule } from './news/news.module';
// ON DÉCOMMENTE L'IMPORT DU MODULE :
import { SchoolsModule } from './schools/schools.module'; 

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
        ssl: true, 
        entities: [User, Student, Class, Grade, Homework, Bulletin, News, School], 
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
    NewsModule,
    SchoolsModule, // <--- ON AJOUTE LE MODULE ICI
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
