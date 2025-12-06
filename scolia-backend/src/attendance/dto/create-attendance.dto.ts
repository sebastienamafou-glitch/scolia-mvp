import { IsNotEmpty, IsArray, IsEnum, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../entities/attendance.entity';

class StudentStatusDto {
  @IsNotEmpty()
  @Type(() => Number) 
  @IsNumber()
  studentId: number; 

  @IsNotEmpty()
  @IsEnum(AttendanceStatus, { message: 'Statut invalide (Présent, Absent, Retard)' })
  status: AttendanceStatus; 
}

export class CreateAttendanceDto {
  @IsNotEmpty({ message: "L'ID de la classe est obligatoire" })
  @Type(() => Number)
  @IsNumber({}, { message: "L'ID de la classe doit être un nombre" })
  classId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentStatusDto)
  students: StudentStatusDto[];
}
