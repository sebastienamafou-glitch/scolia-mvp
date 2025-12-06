import { Controller, Get, Post, Body, Query, BadRequestException, UseGuards, Logger, Request, ForbiddenException } from '@nestjs/common';
import { BulletinsService } from './bulletins.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { RolesGuard } from '../auth/guards/roles.guard';      
import { Roles, UserRole } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bulletins')
export class BulletinsController { // Assure-toi que "export" est là
  // ... (le reste du code est bon)
}
