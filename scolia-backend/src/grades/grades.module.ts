import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { Grade } from './entities/grade.entity';
// Nouveaux imports
import { Bulletin } from './entities/bulletin.entity';
import { BulletinsService } from './bulletins.service';
import { BulletinsController } from './bulletins.controller'; // On va le créer juste après

@Module({
  imports: [TypeOrmModule.forFeature([Grade, Bulletin])], // Ajoutez Bulletin ici
  controllers: [GradesController, BulletinsController],   // Ajoutez le contrôleur
  providers: [GradesService, BulletinsService],           // Ajoutez le service
  exports: [GradesService] // Si besoin ailleurs
})
export class GradesModule {}