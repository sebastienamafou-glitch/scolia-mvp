import { IsNotEmpty, IsArray, IsString, ValidateNested, IsNumberString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class StudentStatusDto {
  @IsNotEmpty()
  // Accepte string ou number et convertit implicitement pour la validation
  studentId: number | string; 

  @IsString()
  @IsNotEmpty()
  status: string; // "Présent", "Absent", "Retard"
}

export class CreateAttendanceDto {
  // ✅ CORRECTION : Utilisation de IsOptional + logique custom ou validation plus souple
  // Souvent le frontend envoie "2" (string) au lieu de 2 (number)
  @IsNotEmpty({ message: "L'ID de la classe est obligatoire" })
  classId: string | number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentStatusDto)
  students: StudentStatusDto[];
}
