import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
  ) {}

  async create(data: any): Promise<Grade> {
    const grade = this.gradesRepository.create({
        ...data,
        student: { id: data.studentId }
    });
    
    const saved = await this.gradesRepository.save(grade);
    return saved as any;
  }

  async findByStudent(studentId: number): Promise<Grade[]> {
    return this.gradesRepository.find({
      where: { student: { id: studentId } },
      order: { date: 'DESC' },
    });
  }
  
  async saveBulk(notesData: any[]): Promise<Grade[]> {
      const grades = notesData.map(n => this.gradesRepository.create({
          ...n,
          student: { id: n.studentId },
          date: new Date()
      }));
      
      // CORRECTION : On force l'entrée (grades) en 'any' pour éviter l'erreur de typage Array
      const saved = await this.gradesRepository.save(grades as any);
      
      return saved as any;
  }
}
