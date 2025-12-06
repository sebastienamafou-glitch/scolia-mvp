// scolia-backend/src/payments/payments.controller.ts

import { 
    Controller, Get, Post, Patch, Body, Query, UseGuards, Request, ForbiddenException, Param 
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// ✅ CORRECTION CHEMIN : guards (pluriel)
import { RolesGuard } from '../auth/guard/roles.guard';
// ✅ CORRECTION : Import Enum
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Accessible à tous pour voir son solde (sécurisé par le service qui filtre par ID)
  @Get('balance')
  async getBalance(@Request() req, @Query('studentId') studentId: string) {
    const schoolId = req.user.schoolId;
    return this.paymentsService.getFeeByStudent(Number(studentId), schoolId);
  }

  // ✅ CORRECTION : UserRole.ADMIN
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('fees') 
  async updateFees(@Request() req, @Body() body: { studentId: number, totalAmount: any, dateLimit?: string }) {
      if (!req.user.schoolId && req.user.role !== UserRole.SUPER_ADMIN) throw new ForbiddenException();

      return this.paymentsService.setStudentTuition(
          Number(body.studentId), 
          Number(body.totalAmount), 
          body.dateLimit || null,   
          req.user.schoolId || 0
      );
  }

  @Roles(UserRole.PARENT, UserRole.STUDENT)
  @Post('submit')
  async submitTransaction(@Request() req, @Body() body: { studentId: number, amount: number, reference: string }) {
    if (!req.user.schoolId) throw new ForbiddenException("Erreur d'authentification école.");
    // Le parent envoie l'ID de l'enfant (studentId) pour qui il paie
    return this.paymentsService.submitTransaction(body.studentId, body.amount, body.reference, req.user.schoolId);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('validate/:id')
  async validateTransaction(@Request() req, @Param('id') transactionId: string) {
    if (!req.user.schoolId && req.user.role !== UserRole.SUPER_ADMIN) throw new ForbiddenException("Accès Admin refusé.");
    return this.paymentsService.validateTransaction(Number(transactionId), req.user.schoolId || 0, req.user.sub);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('pending')
  async getPendingTransactions(@Request() req) {
      if (!req.user.schoolId && req.user.role !== UserRole.SUPER_ADMIN) throw new ForbiddenException("Accès Admin refusé.");
      return this.paymentsService.findPending(req.user.schoolId || 0);
  }

  // Doublon de 'fees', mais gardé pour compatibilité si le front l'utilise
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('set-tuition')
  async setTuition(@Request() req, @Body() body: { studentId: number, amount: number }) {
      if (!req.user.schoolId) throw new ForbiddenException();
      return this.paymentsService.setStudentTuition(body.studentId, body.amount, null, req.user.schoolId);
  }
}
