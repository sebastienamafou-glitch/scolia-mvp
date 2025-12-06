import { IsNotEmpty, IsNumber, IsString, IsArray, IsPositive, Min } from 'class-validator';

export class GradeRecordDto {
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  noteValue: number;
}

export class CreateGradesDto {
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
  @IsPositive()
  noteSur: number;

  @IsArray()
  @IsNotEmpty()
  notes: GradeRecordDto[];
}
