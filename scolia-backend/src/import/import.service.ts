// scolia-backend/src/import/import.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Class } from '../classes/entities/class.entity';
import { parse } from 'csv-parse';

interface CsvUserRow {
    nom: string;
    prenom: string;
    email: string;
    role: string;
    password?: string;
    classe?: string;
    parentId?: string;
    fraisScolarite?: string;
}

@Injectable()
export class ImportService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Class)
    private classRepo: Repository<Class>,
  ) {}

  // On utilise 'any' pour le fichier pour éviter les erreurs de typage si @types/multer manque
  async parseAndImportUsers(file: any, schoolId: number) {
    const rawData = file.buffer.toString('utf8');
    
    // 1. Parsing du CSV
    const records: CsvUserRow[] = await new Promise((resolve, reject) => {
        parse(rawData, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            delimiter: [',', ';']
        }, (err, data) => {
            if (err) return reject(err);
            // 💡 CORRECTION 1 : On force le typage ici pour rassurer TypeScript
            resolve(data as CsvUserRow[]);
        });
    });

    // 2. PRÉ-CHARGEMENT DES CLASSES
    const schoolClasses = await this.classRepo.find({ where: { school: { id: schoolId } } });
    const classMap = new Map<string, number>();
    schoolClasses.forEach(c => classMap.set(c.name.toLowerCase().trim(), c.id));

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // 3. Traitement
    for (const record of records) {
        try {
            // 💡 CORRECTION 2 : On type explicitement la variable pour accepter number ou null
            let foundClassId: number | null = null;

            if (record.classe) {
                const className = record.classe.toLowerCase().trim();
                if (classMap.has(className)) {
                    // Le '!' dit à TS qu'on est sûr que ce n'est pas undefined car on a vérifié avec .has()
                    foundClassId = classMap.get(className)!;
                }
            }

            // Préparation du DTO pour UsersService
            const userData = {
                nom: record.nom,
                prenom: record.prenom,
                email: record.email,
                role: record.role,
                password: record.password,
                
                classId: foundClassId, 
                
                parentId: record.parentId ? Number(record.parentId) : undefined,
                fraisScolarite: record.fraisScolarite ? Number(record.fraisScolarite) : undefined,
                schoolId: schoolId,
            };

            await this.usersService.create(userData);
            successCount++;

        } catch (e) {
            errorCount++;
            const message = e instanceof Error ? e.message : 'Erreur inconnue';
            errors.push(`Ligne ${record.nom} ${record.prenom} : ${message}`);
        }
    }

    return { successCount, errorCount, errors };
  }
}
