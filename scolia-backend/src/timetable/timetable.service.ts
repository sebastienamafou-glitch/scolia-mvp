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
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  // --- 1. LECTURE (Sécurisée) ---
  async findByClass(classId: number): Promise<TimetableEvent[]> {
    try {
        const events = await this.timetableRepo.find({ 
            where: { classId },
        });

        // Si aucun événement, on renvoie une liste vide sans planter
        if (!events || events.length === 0) return [];

        const dayOrder: { [key: string]: number } = { 
            'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4, 'Vendredi': 5, 'Samedi': 6, 'Dimanche': 7 
        };
        
        return events.sort((a, b) => {
            const dayA = dayOrder[a.dayOfWeek] || 99;
            const dayB = dayOrder[b.dayOfWeek] || 99;
            
            const diffDay = dayA - dayB;
            if (diffDay !== 0) return diffDay;
            
            // Tri par heure (gestion sécurisée si startTime est nul)
            return (a.startTime || '').localeCompare(b.startTime || '');
        });
    } catch (error) {
        this.logger.error(`Erreur lecture emploi du temps classe ${classId}`, error);
        return []; // On ne plante pas, on renvoie vide
    }
  }

  // --- 2. GÉNÉRATION IA (Modèle Flash + Logs détaillés) ---
  async generateWithAI(classId: number, constraints: any, schoolId: number) {
    // 👇changement de modèle vers FLASH (plus rapide et stable)
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Agis comme un planificateur scolaire.
      Génère un emploi du temps JSON pour une classe.
      
      MATIÈRES : ${JSON.stringify(constraints)}
      
      RÈGLES :
      - Jours : Lundi, Mardi, Mercredi, Jeudi, Vendredi.
      - Heures : 08:00-12:00 et 14:00-17:00.
      - Format heure : "HH:MM" (ex: "08:00").
      
      FORMAT JSON STRICT (Tableau d'objets) :
      [
        { "day": "Lundi", "start": "08:00", "end": "09:00", "subject": "Maths", "room": "A1" }
      ]
      Retourne UNIQUEMENT le JSON brut, sans markdown, sans mot d'intro.
    `;

    try {
      this.logger.log(`Demande IA envoyée pour classe ${classId}...`);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      this.logger.log("Réponse IA reçue (extrait) : " + text.substring(0, 100) + "...");

      // Nettoyage agressif du JSON
      let jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Extraction pure entre [ et ]
      const firstBracket = jsonString.indexOf('[');
      const lastBracket = jsonString.lastIndexOf(']');
      
      if (firstBracket !== -1 && lastBracket !== -1) {
          jsonString = jsonString.substring(firstBracket, lastBracket + 1);
      } else {
          throw new Error("JSON introuvable dans la réponse IA");
      }

      const scheduleData = JSON.parse(jsonString);

      // Suppression de l'ancien emploi du temps
      await this.timetableRepo.delete({ classId });

      // Insertion des nouveaux cours
      const events = scheduleData.map((slot: any) => {
          return this.timetableRepo.create({
              dayOfWeek: slot.day,
              startTime: slot.start,
              endTime: slot.end,
              subject: slot.subject,
              room: slot.room || 'Salle',
              classId: classId,
              schoolId: schoolId,
              teacherId: null
          });
      });

      const saved = await this.timetableRepo.save(events);
      this.logger.log(`${saved.length} cours sauvegardés avec succès.`);
      return saved;

    } catch (error) {
      this.logger.error("ERREUR CRITIQUE IA :", error);
      // On renvoie l'erreur exacte pour que vous puissiez la voir dans la console navigateur
      throw new InternalServerErrorException(error instanceof Error ? error.message : "Erreur inconnue IA");
    }
  }
}
