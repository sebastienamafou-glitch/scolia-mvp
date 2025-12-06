import { Controller, Get, Post, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // ✅ CORRECTION CHEMIN (dossier guards)
import { Throttle } from '@nestjs/throttler'; 
import { UserRole } from './roles.decorator'; // Supposant qu'il est dans le même dossier auth

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 1. POST /auth/login : Authentifie l'utilisateur
  // ✅ OVERRIDE : Limité à 5 tentatives par 60 secondes pour cette route sensible
  @Throttle({ default: { limit: 5, ttl: 60000 } }) 
  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
        throw new UnauthorizedException('Identifiants incorrects.');
    }
    return this.authService.login(user);
  }

  // 2. GET /auth/me : Récupère les données de l'utilisateur connecté
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    // Retourne le payload du JWT (contenant ID, Rôle, SchoolId)
    return req.user; 
  }
  
  // --- ROUTE TEMPORAIRE POUR DEBUG BCrypt ---
  @Post('hash-me')
  async hashMe(@Body('password') password: string) {
    if (!password) return { error: "Mot de passe requis" };
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    return { hash };
  }
}
