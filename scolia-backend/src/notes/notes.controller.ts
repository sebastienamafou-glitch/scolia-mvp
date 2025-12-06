import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNotesDto } from './dto/create-note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator'; // ✅ Enum

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notes')
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Roles(UserRole.TEACHER, UserRole.ADMIN) // ✅ Correction
  @Post('bulk') 
  async createBulk(@Body() createNotesDto: CreateNotesDto, @Request() req) {
    const teacherId = req.user.sub; 

    return this.notesService.saveBulk(teacherId, createNotesDto.classId.toString(), {
        titre: createNotesDto.titreEvaluation,
        sur: createNotesDto.noteSur
    }, createNotesDto.notes);
  }
}
