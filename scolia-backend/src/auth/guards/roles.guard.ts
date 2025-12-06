// scolia-backend/src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, ROLES_KEY } from '../roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Si aucun rôle requis, on laisse passer (la route est publique ou juste authentifiée)
    if (!requiredRoles) {
      return true; 
    }
    
    const { user } = context.switchToHttp().getRequest();

    // ✅ SÉCURITÉ : Si JwtAuthGuard a échoué ou n'a pas été mis, 'user' est undefined.
    if (!user) {
        throw new ForbiddenException("Accès refusé : Utilisateur non identifié.");
    }
    
    // ✅ BONUS : Le Super Admin a souvent accès à tout (Optionnel selon votre logique métier)
    if (user.role === UserRole.SUPER_ADMIN) {
        return true;
    }

    // Vérification standard
    return requiredRoles.some((role) => user.role === role);
  }
}
