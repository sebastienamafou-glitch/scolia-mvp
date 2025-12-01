// scolia-backend/src/notes/notes.controller.ts

import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNotesDto } from './dto/create-note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notes')
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Roles('Enseignant', 'Admin')
  @Post('bulk') // Route : POST /notes/bulk (saisie par lot)
  async createBulk(@Body() createNotesDto: CreateNotesDto, @Request() req) {
    const teacherId = req.user.sub; // ID de l'enseignant qui saisit

    return this.notesService.saveBulk(teacherId, createNotesDto.classId.toString(), {
        titre: createNotesDto.titreEvaluation,
        sur: createNotesDto.noteSur
    }, createNotesDto.notes);
  }
}
