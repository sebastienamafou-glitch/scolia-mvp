// scolia-backend/src/classes/dto/create-class.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom de la classe est obligatoire' })
  name: string; // ex: "6ème A"

  @IsString()
  @IsNotEmpty({ message: 'Le niveau est obligatoire' }) // 👈 Changé de IsOptional à IsNotEmpty
  level: string; // ex: "6ème"
}
