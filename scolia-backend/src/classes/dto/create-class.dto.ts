// scolia-backend/src/classes/dto/create-class.dto.ts

import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom de la classe est obligatoire' })
  name: string; // ex: "6ème A"

  @IsString()
  @IsOptional()
  level?: string; // ex: "6ème"
}
