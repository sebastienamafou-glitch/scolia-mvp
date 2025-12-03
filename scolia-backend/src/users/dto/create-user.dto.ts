// scolia-backend/src/users/dto/create-user.dto.ts

import { IsString, IsOptional, IsEmail, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateUserDto {
  // --- CHAMPS PRIMAIRES ---
  @IsOptional() 
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  // --- CHAMPS OBLIGATOIRES ---
  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsNotEmpty()
  @IsString()
  prenom: string;

  @IsNotEmpty()
  @IsString()
  role: string;

  // --- TOLÉRANCE POUR LES NOMBRES ---
  @IsOptional()
  fraisScolarite?: any; // On accepte tout pour éviter l'erreur de type

  @IsOptional()
  schoolId?: number; 

  // 👇 LA CORRECTION EST ICI : On déclare classId pour qu'il ne soit pas supprimé
  @IsOptional()
  classId?: any; 
  // ---------------------------------------------------------------------------

  // --- CHAMPS SECONDAIRES ---
  @IsOptional()
  @IsString()
  classe?: string; 

  @IsOptional()
  parentId?: number; 

  @IsOptional()
  @IsString()
  photo?: string;

  // --- TOLÉRANCE DATE ---
  @IsOptional()
  dateNaissance?: string; // On accepte le format texte (ex: "03 / 09 / 2012")

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
  
  // --- CHAMP TOLÉRANT ---
  @IsOptional()
  contactUrgence?: string; 
}
