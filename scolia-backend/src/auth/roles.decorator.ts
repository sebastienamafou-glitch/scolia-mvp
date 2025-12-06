import { SetMetadata } from '@nestjs/common';

// ✅ DÉFINITION CORRIGÉE : Valeurs simples
export enum UserRole {
  SUPER_ADMIN = 'SuperAdmin',
  ADMIN = 'Admin',
  TEACHER = 'Enseignant',
  PARENT = 'Parent',
  STUDENT = 'Student',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
