// scolia-backend/src/users/dto/create-user.dto.ts

import { IsString, IsOptional, IsEmail, IsNotEmpty, IsNumber, IsDateString, IsNumberString } from 'class-validator';

export class CreateUserDto {
  // --- CHAMPS PRIMAIRES (Rendus optionnels pour la génération par le service) ---

  @IsOptional() 
  @IsEmail()
  email?: string; // Rendu optionnel pour l'auto-génération

  @IsOptional()
  @IsString()
  password?: string; // Rendu optionnel pour l'auto-génération

  // --- CHAMPS OBLIGATOIRES ---

  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsNotEmpty()
  @IsString()
  prenom: string;

  @IsNotEmpty()
  @IsString()
  role: string; // Ex: 'Admin', 'Enseignant', 'Parent', 'Élève'

  // 👇 AJOUT CRITIQUE (Corrige l'erreur TS2322 dans ImportService)
  @IsOptional()
  @IsNumber() // Doit être un nombre, puisque vous faites un Number() dans le service
  fraisScolarite?: number; // Utilisez le nom correct ! 

  // ID de l'école (important pour l'Admin qui crée dans SON école)
  @IsOptional()
  @IsNumber()
  schoolId?: number; 

  // --- CHAMPS D'INFORMATIONS SUPPLÉMENTAIRES (MÉTA-DONNÉES) ---
  
  // Classe de l'élève/enseignant (peut être le nom ou l'ID selon votre formulaire)
  @IsOptional()
  @IsString()
  classe?: string; 

  // Relation Parent (ID du parent associé à l'élève)
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
