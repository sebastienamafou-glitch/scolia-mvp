import { Controller, Get, Post, Patch, Body, Query, UseGuards, Request, ForbiddenException, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Parents : Voir le solde
  @Get('balance')
  async getBalance(@Request() req, @Query('studentId') studentId: string) {
    return this.paymentsService.getFeeByStudent(Number(studentId), req.user.schoolId);
  }

  // Parents : Soumettre un paiement
  @Roles('Parent')
  @Post('submit')
  async submitTransaction(@Request() req, @Body() body: { studentId: number, amount: number, reference: string }) {
    return this.paymentsService.submitTransaction(body.studentId, body.amount, body.reference, req.user.schoolId);
  }

  // Admin : Voir les paiements en attente
  @Roles('Admin')
  @Get('pending')
  async getPending(@Request() req) {
    return this.paymentsService.findPending(req.user.schoolId);
  }

  // Admin : Valider ou Rejeter
  @Roles('Admin')
  @Patch('validate/:id')
  async validate(@Request() req, @Param('id') id: string, @Body('action') action: 'validate' | 'reject') {
    return this.paymentsService.validateTransaction(Number(id), req.user.schoolId, action);
  }
}
