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

  // --- TOLÉRANCE POUR LES NOMBRES (Accepte les textes convertibles) ---
  @IsOptional()
  fraisScolarite?: any; // On accepte tout pour éviter l'erreur de type

  @IsOptional()
  schoolId?: number; 

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
  // On accepte les chaînes simples (ex: "03 / 09 / 2012") sans exiger le format ISO strict
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
  
  // --- CHAMP TOLÉRANT (Le "Fourre-tout") ---
  // Permet de recevoir le champ combiné du formulaire sans planter
  @IsOptional()
  contactUrgence?: string; 
}
