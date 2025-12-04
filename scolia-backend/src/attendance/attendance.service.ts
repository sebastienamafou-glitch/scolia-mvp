// scolia-backend/src/attendance/attendance.service.ts

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
  ) {}

  async saveAttendance(teacherId: number, classId: string, records: any[]): Promise<any> {
    // ✅ CORRECTION : Validation des données entrantes
    if (!records || !Array.isArray(records)) {
        this.logger.warn(`Tentative de sauvegarde d'appel vide ou invalide pour classe ${classId}`);
        throw new BadRequestException("Aucune donnée d'appel fournie.");
    }

    const entities = records.map(record => {
        return this.attendanceRepo.create({
            classId: Number(classId),
            studentId: record.studentId,
            status: record.status,
            date: new Date()
        });
    });

    await this.attendanceRepo.save(entities);

    const absences = records.filter(r => r.status !== 'Présent').length;
    this.logger.log(`Appel enregistré. ${absences} absences signalées.`);

    return { success: true, count: entities.length };
  }
  
  async findByStudent(studentId: number) {
      return this.attendanceRepo.find({
          where: { studentId },
          order: { date: 'DESC' }
      });
  }
}
