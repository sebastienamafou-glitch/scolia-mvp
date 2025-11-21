// scolia-backend/src/students/students.controller.ts
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private usersService: UsersService) {}

  @Roles('Parent', 'Admin') 
  @Get('my-children') 
  async getMyChildren(@Request() req) {
    // Étape 1 : LOGGING DE L'ID REÇU DU TOKEN
    console.log("ID utilisateur reçu du JWT (req.user.sub):", req.user.sub); 
    
    // Étape 2 : LOGGING DE L'ID CONVERTI EN NOMBRE
    const parentId = Number(req.user.sub); 
    console.log("ID parent converti pour la recherche:", parentId);
    
    // Étape 3 : Exécution de la recherche
    const children = await this.usersService.findStudentsByParentId(parentId);
    console.log("Nombre d'étudiants trouvés:", children.length); // Doit être 2
    
    // Si la recherche renvoie 0, le problème est dans le UsersService.
    
    return children.map(student => {
        const { password, ...result } = student;
        return result;
    });
  }
}
