// scolia-backend/src/notes/notes.service.ts

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  // Simule l'enregistrement d'un lot de notes pour une évaluation
  async saveBulk(teacherId: number, classId: string, evaluation: any, notes: any[]): Promise<any> {
    this.logger.log(`Enregistrement de ${notes.length} notes par Enseignant ${teacherId} dans la classe ${classId}`);

    // Ici, le code réel ferait une boucle pour insérer chaque note dans la BDD
    return {
      success: true,
      count: notes.length,
      evaluation: evaluation.titre,
      teacherId: teacherId,
    };
  }
}
