// scolia-backend/src/grades/bulletins.controller.ts

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // 👈 Notez le dossier guards
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GradesService } from './grades.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bulletins')
export class BulletinsController {
  constructor(private readonly gradesService: GradesService) {}

  @Roles('Parent', 'Élève', 'Admin', 'Enseignant')
  @Get(':studentId')
  async getBulletin(@Param('studentId') studentId: string) {
    // Logique temporaire pour valider la compilation
    // Vous pourrez connecter la vraie logique de génération de bulletin ici plus tard
    return { message: `Bulletin pour l'étudiant ${studentId}` };
  }
}
