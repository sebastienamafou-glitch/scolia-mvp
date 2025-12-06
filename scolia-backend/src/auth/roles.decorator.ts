// scolia-backend/src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

// ✅ CORRECTION : Utilisation d'une Enum pour éviter les fautes de frappe
// et ajout du SUPER_ADMIN requis par le CDC (Page 2, point 3.1)
export enum UserRole {
  SUPER_ADMIN = UserRole.SUPER_ADMIN, // Gestion plateforme
  ADMIN = UserRole.ADMIN,            // Directeur
  TEACHER = UserRole.TEACHER,
  PARENT = UserRole.PARENT,
  STUDENT = UserRole.STUDENT,        // J'ai retiré l'accent pour éviter les soucis d'encodage JWT
}

export const ROLES_KEY = 'roles';

// ✅ CORRECTION : Typage strict. On ne peut plus passer n'importe quelle string.
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
