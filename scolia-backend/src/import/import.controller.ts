import { Controller, Post, UseInterceptors, UploadedFile, Request, ForbiddenException, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // ✅ CORRIGÉ (guards)
import { RolesGuard } from '../auth/guards/roles.guard';      // ✅ CORRIGÉ (guards)
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Roles(UserRole.ADMIN)
  @Post('users')
  @UseInterceptors(FileInterceptor('file')) 
  async uploadUsers(@UploadedFile() file: any, @Request() req) { // 'any' pour éviter erreur si @types/multer manquant
    if (!file || (file.mimetype && !file.mimetype.includes('csv') && !file.originalname.endsWith('.csv'))) {
      throw new BadRequestException("Veuillez fournir un fichier CSV valide.");
    }

    const schoolId = req.user.schoolId;
    if (!schoolId) throw new ForbiddenException("Opération réservée à un administrateur d'école.");

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
