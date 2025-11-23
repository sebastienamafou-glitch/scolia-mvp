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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // 1. GET /payments/balance?studentId=X (Parent/Admin)
  @Get('balance')
  async getBalance(@Request() req, @Query('studentId') studentId: string) {
    // Utiliser l'ID de l'école du requérant pour filtrer
    const schoolId = req.user.schoolId;
    return this.paymentsService.getFeeByStudent(Number(studentId), schoolId);
  }

  // 2. POST /payments/submit (Parent)
  @Roles('Parent')
  @Post('submit')
  async submitTransaction(@Request() req, @Body() body: { studentId: number, amount: number, reference: string }) {
    if (!req.user.schoolId) throw new ForbiddenException("Erreur d'authentification école.");
    
    // Ici, vous voudriez vérifier que l'élève appartient bien au parent, 
    // mais pour l'instant, on se base sur la sécurité de l'école.
    
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
    
    // La validation met à jour le solde dû de l'élève
    return this.paymentsService.validateTransaction(
        Number(transactionId),
        req.user.schoolId,
        req.user.sub // ID de l'Admin qui valide
    );
  }

  // 4. GET /payments/pending (Admin) - NOUVELLE ROUTE
  @Roles('Admin')
  @Get('pending')
  async getPendingTransactions(@Request() req) {
      if (!req.user.schoolId) throw new ForbiddenException("Accès Admin refusé.");
      return this.paymentsService.findPending(req.user.schoolId);
  }
}
