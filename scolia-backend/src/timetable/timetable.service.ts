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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        this.logger.error("❌ CLÉ API GEMINI MANQUANTE ! Vérifiez le fichier .env");
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  async findByClass(classId: number, schoolId: number): Promise<TimetableEvent[]> {
    try {
        const whereCondition: any = { classId: classId };
        // Si schoolId est > 0, on filtre. Si c'est 0 (SuperAdmin), on ne filtre pas l'école
        if (schoolId > 0) whereCondition.schoolId = schoolId;

        const events = await this.timetableRepo.find({ 
            where: whereCondition,
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

  async generateWithAI(classId: number, constraints: any, schoolId: number) {
    const prompt = `
      Agis comme un planificateur scolaire expert. Crée un emploi du temps JSON pour une classe.
      Jours : Lundi à Vendredi. Horaires : 08:00-12:00, 14:00-17:00.
      MATIÈRES & PROFS : ${JSON.stringify(constraints)}
      FORMAT JSON STRICT : [{"day": "Lundi", "start": "08:00", "end": "09:00", "subject": "Maths", "room": "A1"}, ...]
      Ne réponds QUE par le JSON. Pas de texte avant ou après.
    `;

    const modelsToTry = ["gemini-1.5-flash", "gemini-pro"];
    let scheduleData: any = null; 

    for (const modelName of modelsToTry) {
        try {
            this.logger.log(`🤖 Tentative IA avec le modèle : ${modelName}...`);
            const model = this.genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            const jsonRegex = /\[[\s\S]*\]/; 
            const match = text.match(jsonRegex);
            if (match) {
                scheduleData = JSON.parse(match[0]);
                break; 
            }
        } catch (e: any) {
            this.logger.warn(`⚠️ Échec avec ${modelName}: ${e.message}`);
        }
    }

    if (!scheduleData) {
        throw new InternalServerErrorException("Echec génération IA : Impossible de générer un planning valide.");
    }

    try {
        // Mapping Anglais -> Français au cas où l'IA répond en anglais
        const dayMapping: Record<string, string> = {
            'monday': 'Lundi', 'mon': 'Lundi', 'lundi': 'Lundi',
            'tuesday': 'Mardi', 'tue': 'Mardi', 'mardi': 'Mardi',
            'wednesday': 'Mercredi', 'wed': 'Mercredi', 'mercredi': 'Mercredi',
            'thursday': 'Jeudi', 'thu': 'Jeudi', 'jeudi': 'Jeudi',
            'friday': 'Vendredi', 'fri': 'Vendredi', 'vendredi': 'Vendredi',
            'saturday': 'Samedi', 'sat': 'Samedi', 'samedi': 'Samedi'
        };

        // On nettoie l'ancien emploi du temps de cette classe
        await this.timetableRepo.delete({ classId });

        const events = scheduleData.map((slot: any) => {
            const rawDay = (slot.day || '').toLowerCase().trim();
            const cleanDay = dayMapping[rawDay] || slot.day; 

            return this.timetableRepo.create({
                dayOfWeek: cleanDay,
                startTime: slot.start,
                endTime: slot.end,
                subject: slot.subject,
                room: slot.room || 'Salle',
                classId: classId,
                schoolId: schoolId, // Important pour le cloisonnement
                teacherId: null // L'IA ne gère pas encore les ID profs, à lier plus tard
            });
        });

        const saved = await this.timetableRepo.save(events);
        this.logger.log(`🎉 Planning généré : ${saved.length} cours.`);
        return saved;

    } catch (error) {
      this.logger.error("ERREUR SAUVEGARDE IA :", error);
      throw new InternalServerErrorException("Erreur interne lors de la sauvegarde.");
    }
  }
}
