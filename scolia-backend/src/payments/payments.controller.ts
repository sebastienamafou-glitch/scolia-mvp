// scolia-backend/src/payments/payments.controller.ts

import { 
    Controller, 
    Get, 
    Post, 
    Patch, 
    Body, 
    Query, 
    UseGuards, 
    Request,
    ForbiddenException, 
    Param, 
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // 1. GET /payments/balance?studentId=X (Parent/Admin)
  @Get('balance')
  async getBalance(@Request() req, @Query('studentId') studentId: string) {
    const schoolId = req.user.schoolId;
    return this.paymentsService.getFeeByStudent(Number(studentId), schoolId);
  }

  // 👇👇👇 NOUVELLE ROUTE AJOUTÉE (CORRECTION ERREUR 404) 👇👇👇
  @Roles('Admin')
  @Post('fees') 
  async updateFees(@Request() req, @Body() body: { studentId: number, totalAmount: number, dateLimit?: string }) {
      if (!req.user.schoolId) throw new ForbiddenException();

      // On redirige vers la méthode existante du service
      return this.paymentsService.setStudentTuition(
          body.studentId, 
          body.totalAmount, 
          req.user.schoolId
      );
  }
  // -------------------------------------------------------------

  // 2. POST /payments/submit (Parent)
  @Roles('Parent')
  @Post('submit')
  async submitTransaction(@Request() req, @Body() body: { studentId: number, amount: number, reference: string }) {
    if (!req.user.schoolId) throw new ForbiddenException("Erreur d'authentification école.");
    
    return this.paymentsService.submitTransaction(
        body.studentId,
        body.amount,
        body.reference,
        req.user.schoolId
    );
  }

  // 3. PATCH /payments/validate/:id (Admin)
  @Roles('Admin')
  @Patch('validate/:id')
  async validateTransaction(@Request() req, @Param('id') transactionId: string) {
    if (!req.user.schoolId) throw new ForbiddenException("Accès Admin refusé.");
    
    return this.paymentsService.validateTransaction(
        Number(transactionId),
        req.user.schoolId,
        req.user.sub 
    );
  }

  // 4. GET /payments/pending (Admin)
  @Roles('Admin')
  @Get('pending')
  async getPendingTransactions(@Request() req) {
      if (!req.user.schoolId) throw new ForbiddenException("Accès Admin refusé.");
      return this.paymentsService.findPending(req.user.schoolId);
  }

  // 5. POST /payments/set-tuition (Admin - Autre méthode)
  @Roles('Admin')
  @Post('set-tuition')
  async setTuition(@Request() req, @Body() body: { studentId: number, amount: number }) {
      if (!req.user.schoolId) throw new ForbiddenException();
      
      return this.paymentsService.setStudentTuition(
          body.studentId, 
          body.amount, 
          req.user.schoolId
      );
  }
}
