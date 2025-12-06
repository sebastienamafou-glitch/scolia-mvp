import { IsString, IsOptional, IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { UserRole } from '../../auth/roles.decorator';

export class CreateUserDto {
  @IsOptional() 
  @IsEmail()
  email?: string;

  // Pas de password ici, il est généré auto

  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsNotEmpty()
  @IsString()
  prenom: string;

  @IsNotEmpty()
  @IsEnum(UserRole, { message: 'Rôle invalide' })
  role: UserRole;

  @IsOptional()
  fraisScolarite?: any; 

  @IsOptional()
  schoolId?: number; 

  @IsOptional()
  classId?: any; 

  @IsOptional()
  parentId?: number; 

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  dateNaissance?: string;

  @IsOptional()
  adresse?: string;

  @IsOptional()
  contactUrgenceNom?: string;

  @IsOptional()
  contactUrgenceTel?: string;

  @IsOptional()
  infosMedicales?: string;
}
