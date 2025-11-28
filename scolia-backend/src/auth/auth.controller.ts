import { Controller, Get, Post, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard'; // Assurez-vous que le chemin est correct
import { Throttle } from '@nestjs/throttler'; // 👈 Importez Throttle

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 1. POST /auth/login : Authentifie l'utilisateur
  // ✅ OVERRIDE : Limité à 5 tentatives par 60 secondes pour cette route sensible (prévention du brute force)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) 
  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
        // Le 401 est géré ici si la validation échoue
        throw new UnauthorizedException('Identifiants incorrects.');
    }
    return this.authService.login(user);
  }

  // 2. GET /auth/me : Récupère les données de l'utilisateur connecté
  // Cette route utilisera la limite globale définie dans AppModule (10 requêtes / minute)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    // Retourne le payload du JWT (qui contient l'ID, le Rôle, et le SchoolId)
    return req.user; 
  }
  
  // --- ROUTE TEMPORAIRE POUR DEBUG BCrypt ---
  // Objectif : Générer un hash compatible avec le serveur LIVE pour débloquer la connexion
  @Post('hash-me')
  async hashMe(@Body('password') password: string) {
    if (!password) return { error: "Mot de passe requis" };
    
    // Utilise le même facteur de complexité (salt rounds = 10)
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    return { hash };
  }
}
