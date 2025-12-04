import { IsNotEmpty, IsArray, IsString, IsNumber, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class StudentStatusDto {
  @IsNotEmpty()
  studentId: number;

  @IsString()
  @IsNotEmpty()
  status: string; // "Présent", "Absent", "Retard"
}

export class CreateAttendanceDto {
  // On accepte string ou number pour éviter les erreurs de conversion frontend
  @IsNotEmpty({ message: "L'ID de la classe est obligatoire" })
  classId: string | number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentStatusDto)
  students: StudentStatusDto[];
}
