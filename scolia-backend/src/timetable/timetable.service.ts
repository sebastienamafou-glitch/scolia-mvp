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
    // Vérification de la clé API au démarrage
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        this.logger.error("❌ CLÉ API GEMINI MANQUANTE DANS LES VARIABLES D'ENVIRONNEMENT !");
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  // --- 1. LECTURE (Sécurisée) ---
  async findByClass(classId: number): Promise<TimetableEvent[]> {
    try {
        const events = await this.timetableRepo.find({ 
            where: { classId },
        });

        if (!events || events.length === 0) return [];

        const dayOrder: { [key: string]: number } = { 
            'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4, 'Vendredi': 5, 'Samedi': 6, 'Dimanche': 7 
        };
        
        return events.sort((a, b) => {
            const dayA = dayOrder[a.dayOfWeek] || 99;
            const dayB = dayOrder[b.dayOfWeek] || 99;
            const diffDay = dayA - dayB;
            return diffDay !== 0 ? diffDay : (a.startTime || '').localeCompare(b.startTime || '');
        });
    } catch (error) {
        this.logger.error(`Erreur lecture emploi du temps classe ${classId}`, error);
        return [];
    }
  }

  // --- 2. GÉNÉRATION IA (BLINDÉE) ---
  async generateWithAI(classId: number, constraints: any, schoolId: number) {
    // Utilisation du modèle Pro (souvent plus stable pour le JSON complexe que Flash)
    // Si Pro échoue (quota), repassez à "gemini-1.5-flash"
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Tu es un expert en planification scolaire. Génère un emploi du temps pour une classe.
      
      CONTRAINTES STRICTES :
      - Jours : Lundi, Mardi, Mercredi, Jeudi, Vendredi.
      - Horaires : 08:00-12:00 et 14:00-17:00.
      - Pause déjeuner : 12:00-14:00 (ne rien placer ici).
      
      MATIÈRES À PLACER : ${JSON.stringify(constraints)}
      
      FORMAT DE RÉPONSE OBLIGATOIRE :
      Tu dois répondre UNIQUEMENT par un tableau JSON valide. Pas de texte avant, pas de texte après.
      Exemple de format attendu :
      [
        { "day": "Lundi", "start": "08:00", "end": "09:00", "subject": "Maths", "room": "A1" },
        { "day": "Mardi", "start": "14:00", "end": "16:00", "subject": "Sport", "room": "Gymnase" }
      ]
    `;

    try {
      this.logger.log(`🤖 Envoi demande IA pour classe ${classId}...`);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      this.logger.log("✅ Réponse IA reçue. Début du nettoyage...");

      // --- NETTOYAGE ROBUSTE (REGEX) ---
      // On cherche le premier crochet ouvrant '[' et le dernier fermant ']'
      // Cela permet d'ignorer tout texte d'introduction type "Voici le résultat :"
      const jsonRegex = /\[[\s\S]*\]/; 
      const match = text.match(jsonRegex);

      if (!match) {
          this.logger.error("❌ Pas de JSON trouvé dans la réponse : " + text.substring(0, 100));
          throw new Error("L'IA n'a pas renvoyé de format valide.");
      }

      const cleanJsonString = match[0]; // On garde uniquement la partie tableau JSON
      
      let scheduleData;
      try {
          scheduleData = JSON.parse(cleanJsonString);
      } catch (e) {
          this.logger.error("❌ Erreur Syntax JSON", e);
          // Si le JSON est mal formé, on log la chaine pour débugger
          this.logger.error("Chaine JSON reçue :", cleanJsonString);
          throw new Error("Le JSON renvoyé par l'IA est mal formé.");
      }

      // --- SAUVEGARDE EN BDD ---
      await this.timetableRepo.delete({ classId });

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
      this.logger.log(`🎉 ${saved.length} cours créés avec succès !`);
      return saved;

    } catch (error) {
      // Log détaillé pour voir l'erreur exacte dans Render
      this.logger.error("ERREUR CRITIQUE IA :", error);
      throw new InternalServerErrorException(
          error instanceof Error ? error.message : "Erreur interne lors de la génération"
      );
    }
  }
}
