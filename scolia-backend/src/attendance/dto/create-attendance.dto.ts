import { IsNotEmpty, IsArray, IsString, ValidateNested, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class StudentStatusDto {
  @IsNotEmpty()
  @Type(() => Number) // 👈 Force la conversion en Nombre (évite erreur si frontend envoie "15")
  @IsNumber()
  studentId: number; 

  @IsString()
  @IsNotEmpty()
  status: string; // "Présent", "Absent", "Retard"
}

export class CreateAttendanceDto {
  @IsNotEmpty({ message: "L'ID de la classe est obligatoire" })
  @Type(() => Number) // 👈 Force la conversion "2" -> 2
  @IsNumber({}, { message: "L'ID de la classe doit être un nombre" })
  classId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentStatusDto)
  students: StudentStatusDto[];
}
