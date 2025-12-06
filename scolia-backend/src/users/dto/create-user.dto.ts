import { IsString, IsOptional, IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { UserRole } from '../../auth/roles.decorator';

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

  // ✅ CORRECTION : Validation stricte
  @IsNotEmpty()
  @IsEnum(UserRole, { message: 'Rôle invalide' })
  role: UserRole;

  // --- TOLÉRANCE POUR LES NOMBRES ---
  @IsOptional()
  fraisScolarite?: any; 

  @IsOptional()
  schoolId?: number; 

  @IsOptional()
  classId?: any; 

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
  
  @IsOptional()
  contactUrgence?: string; 
}
