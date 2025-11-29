// scolia-backend/src/attendance/attendance.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity'; // 👈 Import de la nouvelle entité

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
  ) {}

  async saveAttendance(teacherId: number, classId: string, records: any[]): Promise<any> {
    // Transformation des données pour la BDD
    const entities = records.map(record => {
        return this.attendanceRepo.create({
            classId: Number(classId),
            studentId: record.studentId,
            status: record.status,
            date: new Date() // Date du jour
        });
    });

    // Sauvegarde en une seule fois (Bulk)
    await this.attendanceRepo.save(entities);

    const absences = records.filter(r => r.status !== 'Présent').length;
    this.logger.log(`Appel enregistré. ${absences} absences signalées.`);

    return { success: true, count: entities.length };
  }
  
  // Implémentation de la lecture pour les parents
  async findByStudent(studentId: number) {
      return this.attendanceRepo.find({
          where: { studentId },
          order: { date: 'DESC' }
      });
  }
}
