// scolia-backend/src/auth/auth.controller.ts
import { Controller, Post, UseGuards, Request, Body, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; 

@Controller('auth') // Route de base : /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login') // Route finale : POST /auth/login
  async login(@Request() req, @Body() body) {
    return this.authService.login(req.user);
  }
  
  // ROUTE PROTÉGÉE : Teste la validité du Token JWT (accessible par tous les rôles)
  @UseGuards(JwtAuthGuard)
  @Get('me') // Route finale : GET /auth/me
  getProfile(@Request() req) {
    // req.user contient l'objet décodé du JWT (id, email, role)
    return req.user;
  }
}
