// scolia-backend/src/users/dto/create-user.dto.ts

import { IsEmail, IsNotEmpty, IsString, IsOptional, IsIn, IsNumber, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
  @IsOptional() 
  password?: string;

  @IsString()
  @IsIn(['Admin', 'Enseignant', 'Parent', 'Élève', 'SuperAdmin'], { message: "Le rôle fourni n'est pas valide." }) // 👈 Mise à jour des rôles
  @IsNotEmpty()
  role!: string;

  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsString()
  @IsNotEmpty()
  prenom!: string;

  @IsString() @IsOptional() photo?: string; 
  
  // --- CHAMPS SPÉCIFIQUES ÉLÈVE (Validation forte pour les IDs et les montants) ---
  @IsString() @IsOptional() classe?: string;
  @IsNumber() @IsOptional() parentId?: number; // transform: true dans main.ts convertit la string en number
  
  @IsString() @IsOptional() dateNaissance?: string;
  @IsString() @IsOptional() adresse?: string;
  @IsString() @IsOptional() contactUrgenceNom?: string;
  @IsString() @IsOptional() contactUrgenceTel?: string;
  @IsString() @IsOptional() infosMedicales?: string;

  // --- CHAMPS FRAIS DE SCOLARITÉ ---
  @IsNumber()
  @IsOptional()
  fraisScolarite?: number; // Sera extrait par le service pour la table FEE
}
