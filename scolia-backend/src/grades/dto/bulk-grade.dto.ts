// scolia-backend/src/grades/dto/bulk-grade.dto.ts

import { IsNumber, IsString, IsNotEmpty, Min, IsArray, ValidateNested, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkGradeItemDto {
    @IsNumber()
    @IsNotEmpty()
    studentId: number;

    @IsNumber()
    @Min(0)
    noteValue: number;
}

export class BulkGradeDto {
    @IsNumber()
    @IsNotEmpty()
    classId: number;

    @IsString()
    @IsNotEmpty()
    matiere: string;

    @IsNumber()
    @IsPositive()
    noteSur: number;

    @IsString()
    @IsNotEmpty()
    titreEvaluation: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BulkGradeItemDto)
    notes: BulkGradeItemDto[]; 
}
