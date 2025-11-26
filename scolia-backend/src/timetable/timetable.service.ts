// scolia-backend/src/timetable/timetable.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimetableEvent } from './entities/timetable-event.entity'; // 👈 Vérifiez que c'est le bon chemin
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class TimetableService {
  private genAI: GoogleGenerativeAI;

  constructor(
    @InjectRepository(TimetableEvent)
    private timetableRepo: Repository<TimetableEvent>,
  ) {
    // Initialisation de l'IA
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  // 1. Récupérer l'emploi du temps (Lecture)
  async findByClass(classId: number): Promise<TimetableEvent[]> {
    return this.timetableRepo.find({ 
        where: { classId },
        order: { dayOfWeek: 'ASC', startTime: 'ASC' } 
    });
  }

  // 2. Générer avec IA (Écriture)
  async generateWithAI(classId: number, constraints: any, schoolId: number) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Agis comme un planificateur scolaire expert.
      Génère un emploi du temps hebdomadaire structuré.
      
      CONTRAINTES :
      - Jours : Lundi, Mardi, Mercredi, Jeudi, Vendredi.
      - Horaires : 08:00 - 12:00 et 14:00 - 17:00.
      - Pause Midi : 12:00 - 14:00.
      
      MATIÈRES À PLACER :
      ${JSON.stringify(constraints)}

      FORMAT JSON STRICT ATTENDU :
      [
        { "day": "Lundi", "start": "08:00", "end": "09:00", "subject": "Maths", "room": "S-101" }
      ]
      Réponds UNIQUEMENT avec le JSON.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Nettoyage du JSON brut renvoyé par l'IA
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const scheduleData = JSON.parse(cleanedText);

      // Nettoyage avant insertion
      await this.timetableRepo.delete({ classId });

      // Mapping vers votre entité TimetableEvent
      const events = scheduleData.map((slot: any) => {
          return this.timetableRepo.create({
              dayOfWeek: slot.day,
              startTime: slot.start,
              endTime: slot.end,
              subject: slot.subject,
              room: slot.room || 'Salle de classe',
              classId: classId,
              schoolId: schoolId,
              teacherId: null
          });
      });

      return await this.timetableRepo.save(events);

    } catch (error) {
      console.error("Erreur IA :", error);
      throw new InternalServerErrorException("L'IA n'a pas pu générer l'emploi du temps.");
    }
  }
}
