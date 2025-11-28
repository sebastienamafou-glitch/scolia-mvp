import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimetableEvent } from './entities/timetable-event.entity';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class TimetableService {
  private genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(TimetableService.name);

  constructor(
    @InjectRepository(TimetableEvent)
    private timetableRepo: Repository<TimetableEvent>,
  ) {
    // S'assure que la clé API est bien chargée
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  // 1. Récupérer l'emploi du temps (Lecture)
  async findByClass(classId: number): Promise<TimetableEvent[]> {
    const events = await this.timetableRepo.find({ 
        where: { classId },
    });

    // Tri manuel des jours car "Lundi", "Mardi" ne se trient pas alphabétiquement correctement
    const dayOrder = { 'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4, 'Vendredi': 5, 'Samedi': 6, 'Dimanche': 7 };
    
    return events.sort((a, b) => {
        const dayDiff = (dayOrder[a.dayOfWeek] || 99) - (dayOrder[b.dayOfWeek] || 99);
        if (dayDiff !== 0) return dayDiff;
        return a.startTime.localeCompare(b.startTime); // Tri par heure ensuite
    });
  }

  // 2. Générer avec IA (Écriture)
  async generateWithAI(classId: number, constraints: any, schoolId: number) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Agis comme un planificateur scolaire expert.
      Génère un emploi du temps hebdomadaire structuré en JSON.
      
      CONTRAINTES :
      - Jours : Lundi, Mardi, Mercredi, Jeudi, Vendredi.
      - Horaires possibles : 08:00 à 12:00 et 14:00 à 17:00.
      - Pause Midi obligatoire : 12:00 à 14:00 (pas de cours).
      - Durée des cours : 1h ou 2h.
      
      MATIÈRES À PLACER (et leur fréquence par semaine) :
      ${JSON.stringify(constraints)}

      FORMAT DE RÉPONSE ATTENDU (Uniquement ce tableau JSON, pas de texte autour) :
      [
        { "day": "Lundi", "start": "08:00", "end": "09:00", "subject": "Maths", "room": "Salle 1" }
      ]
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Nettoyage robuste du JSON (l'IA met souvent des balises markdown ```json ... ```)
      const jsonString = text.replace(/```json|```/g, '').trim();
      
      // Chercher le début '[' et la fin ']' pour ignorer le blabla éventuel de l'IA
      const startIndex = jsonString.indexOf('[');
      const endIndex = jsonString.lastIndexOf(']');
      
      if (startIndex === -1 || endIndex === -1) {
          throw new Error("Format JSON invalide reçu de l'IA");
      }

      const cleanJson = jsonString.substring(startIndex, endIndex + 1);
      const scheduleData = JSON.parse(cleanJson);

      // Suppression de l'ancien emploi du temps pour cette classe
      await this.timetableRepo.delete({ classId });

      // Création des nouveaux événements
      const events = scheduleData.map((slot: any) => {
          return this.timetableRepo.create({
              dayOfWeek: slot.day,
              startTime: slot.start,
              endTime: slot.end,
              subject: slot.subject,
              room: slot.room || 'Salle de classe',
              classId: classId,
              schoolId: schoolId,
              teacherId: null // Pour l'instant, on n'assigne pas de prof spécifique
          });
      });

      return await this.timetableRepo.save(events);

    } catch (error) {
      this.logger.error("Erreur génération IA :", error);
      throw new InternalServerErrorException("L'IA n'a pas pu générer l'emploi du temps. Vérifiez les quotas ou réessayez.");
    }
  }
}
