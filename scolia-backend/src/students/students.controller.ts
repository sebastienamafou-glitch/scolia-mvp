import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const student = await this.studentsService.findOne(+id);
    
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Pas besoin de filtrer le mot de passe, l'entité Student n'en a pas !
    return student;
  }
}
