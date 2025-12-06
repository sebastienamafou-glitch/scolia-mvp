import { Controller, Post, UseInterceptors, UploadedFile, Request, ForbiddenException, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Roles(UserRole.ADMIN)
  @Post('users')
  // Le nom du champ de formulaire doit être 'file'
  @UseInterceptors(FileInterceptor('file')) 
  async uploadUsers(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file || !file.mimetype.includes('csv')) {
      throw new BadRequestException("Veuillez fournir un fichier CSV valide.");
    }

    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Opération réservée à un administrateur d'école.");

    // Le service gère le parsing et l'insertion dans la base de données
    const result = await this.importService.parseAndImportUsers(file, schoolId);

    if (result.errorCount > 0) {
        return {
            success: false,
            message: `${result.successCount} utilisateurs importés, mais ${result.errorCount} erreurs rencontrées.`,
            details: result.errors,
        };
    }

    return {
        success: true,
        message: `✅ Importation réussie : ${result.successCount} utilisateurs ont été créés !`,
    };
  }
}
