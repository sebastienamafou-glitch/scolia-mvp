// scolia-backend/src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

// ✅ CORRECTION : Utilisation d'une Enum pour éviter les fautes de frappe
// et ajout du SUPER_ADMIN requis par le CDC (Page 2, point 3.1)
export enum UserRole {
  SUPER_ADMIN = 'SuperAdmin', // Gestion plateforme
  ADMIN = 'Admin',            // Directeur
  TEACHER = 'Enseignant',
  PARENT = 'Parent',
  STUDENT = 'Student',        // J'ai retiré l'accent pour éviter les soucis d'encodage JWT
}

export const ROLES_KEY = 'roles';

// ✅ CORRECTION : Typage strict. On ne peut plus passer n'importe quelle string.
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
