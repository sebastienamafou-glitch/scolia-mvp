// create-attendance.dto.ts
import { IsInt, IsString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class AttendanceRecordDto {
  @IsInt()
  studentId: number;

  @IsEnum(['Présent', 'Absent', 'Retard'])
  status: string;
}

export class CreateAttendanceDto {
  @IsInt() // ou IsString selon votre BDD
  classId: number; 

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}
