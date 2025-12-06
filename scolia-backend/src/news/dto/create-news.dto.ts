import { IsNotEmpty, IsString, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { TargetAudience } from '../entities/news.entity'; // Assure-toi d'exporter ce type depuis l'entité

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  targetRole?: string; // 'All', 'Enseignant', 'Parent'

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;
}
