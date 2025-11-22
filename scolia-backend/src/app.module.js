"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const user_entity_1 = require("./users/entities/user.entity");
const student_entity_1 = require("./students/entities/student.entity");
const class_entity_1 = require("./classes/entities/class.entity");
const grade_entity_1 = require("./grades/entities/grade.entity");
const homework_entity_1 = require("./homeworks/entities/homework.entity");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const students_module_1 = require("./students/students.module");
const classes_module_1 = require("./classes/classes.module");
const grades_module_1 = require("./grades/grades.module");
const homeworks_module_1 = require("./homeworks/homeworks.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST'),
                    port: 5432,
                    username: configService.get('DB_USER'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_DATABASE'),
                    ssl: true,
                    entities: [user_entity_1.User, student_entity_1.Student, class_entity_1.Class, grade_entity_1.Grade, homework_entity_1.Homework],
                    synchronize: true,
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            students_module_1.StudentsModule,
            classes_module_1.ClassesModule,
            grades_module_1.GradesModule,
            homeworks_module_1.HomeworksModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map