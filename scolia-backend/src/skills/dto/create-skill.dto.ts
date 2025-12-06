import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSkillDto {
  @IsNotEmpty({ message: "Le nom de la compétence est obligatoire." })
  @IsString()
  name: string;

  @IsNotEmpty({ message: "La catégorie est obligatoire (ex: Soft Skills, Maths...)." })
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  description?: string;
}
