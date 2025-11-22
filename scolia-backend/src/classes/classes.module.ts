import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- Import important
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { Class } from './entities/class.entity'; // <--- Vérifiez que ce chemin est correct

@Module({
  imports: [
    TypeOrmModule.forFeature([Class]) // <--- Indispensable pour que le Service puisse accéder à la base de données
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [TypeOrmModule] // (Optionnel) Utile si d'autres modules ont besoin du repository Class
})
export class ClassesModule {}
