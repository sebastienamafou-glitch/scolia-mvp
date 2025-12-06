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

  async saveAttendance(teacherId: number, classId: number, records: any[], schoolId: number): Promise<any> {
    if (!records || !Array.isArray(records)) {
        throw new BadRequestException("Aucune donnée d'appel fournie.");
    }

    const entities = records.map(record => {
        return this.attendanceRepo.create({
            classId: Number(classId),
            studentId: record.studentId, // ID de l'entité Student
            status: record.status,
            date: new Date(),
            teacher: { id: teacherId } as any,
            school: { id: schoolId } as any // ✅ Sécurisation
        });
    });

    await this.attendanceRepo.save(entities);

    const absences = records.filter(r => r.status !== 'Présent').length;
    this.logger.log(`Appel enregistré pour la classe ${classId}. ${absences} absences signalées.`);
    
    // ICI : Possibilité d'émettre un événement 'attendance.created' pour les notifications Push

    return { success: true, count: entities.length };
  }
  
  async findByStudent(studentId: number) {
      return this.attendanceRepo.find({
          where: { studentId },
          order: { date: 'DESC' }
      });
  }
}
