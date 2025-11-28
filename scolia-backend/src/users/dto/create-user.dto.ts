// scolia-backend/src/users/dto/create-user.dto.ts

import { IsString, IsOptional, IsEmail, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateUserDto {
  // 👇 MODIFICATION CRITIQUE 1 : Rendre l'email facultatif pour la génération
  @IsOptional() 
  @IsEmail()
  email?: string; 

  // 👇 MODIFICATION CRITIQUE 2 : Rendre le mot de passe facultatif pour l'auto-génération
  @IsOptional()
  @IsString()
  password?: string; 

  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsNotEmpty()
  @IsString()
  prenom: string;

  @IsNotEmpty()
  @IsString()
  role: string; 

  // --- Le reste de vos champs facultatifs ---
  @IsOptional()
  @IsString()
  classe?: string;
  
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsDateString()
  dateNaissance?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsString()
  contactUrgenceNom?: string;

  @IsOptional()
  @IsString()
  contactUrgenceTel?: string;

  @IsOptional()
  @IsString()
  infosMedicales?: string;
}
