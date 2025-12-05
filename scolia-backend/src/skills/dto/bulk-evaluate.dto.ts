import { IsNotEmpty, IsNumber, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class EvaluationItemDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  competenceId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5) // On limite la note entre 1 et 5 (tu peux changer ça)
  level: number;
}

export class BulkEvaluateDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  studentId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluationItemDto)
  evaluations: EvaluationItemDto[];
}
