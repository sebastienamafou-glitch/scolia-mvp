// scolia-backend/src/auth/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from '../roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Récupérer les rôles requis (définis par le décorateur @Roles sur la route)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Si aucun rôle n'est spécifié (@Roles n'est pas utilisé), la route est accessible à tous les utilisateurs authentifiés.
    if (!requiredRoles) {
      return true; 
    }
    
    // 2. Récupérer l'utilisateur connecté (mis là par le JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();
    
    // 3. Vérifier si le rôle de l'utilisateur correspond à un rôle requis
    return requiredRoles.some((role) => user.role === role);
  }
}
