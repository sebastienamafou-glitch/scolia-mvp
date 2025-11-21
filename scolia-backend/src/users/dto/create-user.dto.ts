// scolia-backend/src/users/dto/create-user.dto.ts

import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['Admin', 'Enseignant', 'Parent', 'Élève']) // On force ces rôles uniquement
  role: string;

  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  prenom: string;

  // Optionnel : Uniquement pour les élèves
  @IsString()
  @IsOptional()
  classe?: string;

  // Optionnel : Pour lier un élève à son parent
  @IsNumber()
  @IsOptional()
  parentId?: number;
}
