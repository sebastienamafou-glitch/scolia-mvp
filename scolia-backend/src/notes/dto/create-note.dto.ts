// scolia-backend/src/notes/dto/create-note.dto.ts
import { IsNotEmpty, IsNumber, IsString, IsArray, IsPositive } from 'class-validator';

export class NoteRecordDto {
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @IsNumber()
  @IsNotEmpty()
  noteValue: number;
}

export class CreateNotesDto {
  @IsNumber()
  @IsNotEmpty()
  classId: number;

  @IsString()
  @IsNotEmpty()
  matiere: string;
  
  @IsString()
  @IsNotEmpty()
  titreEvaluation: string;
  
  @IsNumber()
  @IsNotEmpty()
  @IsPositive() // Ajout de IsPositive pour s'assurer que la note 'sur' est positive
  noteSur: number;

  @IsArray()
  @IsNotEmpty()
  notes: NoteRecordDto[];
}
