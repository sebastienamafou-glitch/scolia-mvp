// scolia-backend/src/payments/payments.controller.ts

import { 
    Controller, Get, Post, Patch, Body, Query, UseGuards, Request, ForbiddenException, Param 
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('balance')
  async getBalance(@Request() req, @Query('studentId') studentId: string) {
    const schoolId = req.user.schoolId;
    return this.paymentsService.getFeeByStudent(Number(studentId), schoolId);
  }

  // 👇 ROUTE CORRIGÉE
  @Roles('Admin')
  @Post('fees') 
  async updateFees(@Request() req, @Body() body: { studentId: number, totalAmount: any, dateLimit?: string }) {
      if (!req.user.schoolId) throw new ForbiddenException();

      return this.paymentsService.setStudentTuition(
          Number(body.studentId), 
          Number(body.totalAmount), // Force la conversion en nombre
          body.dateLimit || null,   // Passe la date
          req.user.schoolId
      );
  }

  @Roles('Parent')
  @Post('submit')
  async submitTransaction(@Request() req, @Body() body: { studentId: number, amount: number, reference: string }) {
    if (!req.user.schoolId) throw new ForbiddenException("Erreur d'authentification école.");
    return this.paymentsService.submitTransaction(body.studentId, body.amount, body.reference, req.user.schoolId);
  }

  @Roles('Admin')
  @Patch('validate/:id')
  async validateTransaction(@Request() req, @Param('id') transactionId: string) {
    if (!req.user.schoolId) throw new ForbiddenException("Accès Admin refusé.");
    return this.paymentsService.validateTransaction(Number(transactionId), req.user.schoolId, req.user.sub);
  }

  @Roles('Admin')
  @Get('pending')
  async getPendingTransactions(@Request() req) {
      if (!req.user.schoolId) throw new ForbiddenException("Accès Admin refusé.");
      return this.paymentsService.findPending(req.user.schoolId);
  }

  @Roles('Admin')
  @Post('set-tuition')
  async setTuition(@Request() req, @Body() body: { studentId: number, amount: number }) {
      if (!req.user.schoolId) throw new ForbiddenException();
      return this.paymentsService.setStudentTuition(body.studentId, body.amount, null, req.user.schoolId);
  }
}
