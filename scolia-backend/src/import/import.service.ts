// scolia-backend/src/import/import.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { parse } from 'csv-parse';
import { CreateUserDto } from '../users/dto/create-user.dto';

// Définition des champs CSV attendus
interface CsvUserRow {
    nom: string;
    prenom: string;
    email: string;
    role: 'Admin' | 'Enseignant' | 'Parent' | 'Élève';
    password?: string;
    classe?: string;
    parentId?: string; // string car vient du CSV
    fraisScolarite?: string; // string car vient du CSV
}

@Injectable()
export class ImportService {
  constructor(private usersService: UsersService) {}

  async parseAndImportUsers(file: Express.Multer.File, schoolId: number): Promise<{ successCount: number, errorCount: number, errors: string[] }> {
    const rawData = file.buffer.toString('utf8');
    
    // 💡 CORRECTION : La Promise résout maintenant explicitement en CsvUserRow[]
    const records: CsvUserRow[] = await new Promise<CsvUserRow[]>((resolve, reject) => {
        parse(rawData, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        }, (err, records: any) => { // 'records' est de type any ici
            if (err) return reject(err);
            // On résout la promise avec les types corrects
            resolve(records as CsvUserRow[]); 
        });
    });

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Traitement ligne par ligne
    for (const record of records) {
        try {
            // Création de l'objet DTO
            const userData: CreateUserDto = {
                nom: record.nom,
                prenom: record.prenom,
                email: record.email,
                role: record.role,
                password: record.password,
                classe: record.classe,
                // On s'assure que les champs numériques sont bien des nombres ou null
                parentId: record.parentId ? Number(record.parentId) : undefined,
                // On utilise Number(string) pour convertir les montants
                fraisScolarite: record.fraisScolarite ? Number(record.fraisScolarite) : undefined,
            };

            // Appel au service de création existant 
            await this.usersService.create({ 
                ...userData,
                schoolId: schoolId,
                email: record.email || undefined // Laisse le service générer si email est vide
            } as any); 

            successCount++;
        } catch (e) {
            errorCount++;
            errors.push(`Erreur ligne ${successCount + errorCount}: ${record.nom} ${record.prenom} - ${e.message}`);
        }
    }

    return { successCount, errorCount, errors };
  }
}
