// scolia-backend/src/auth/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';

// Le type d'utilisateur est simple pour le moment
export type Role = 'Admin' | 'Enseignant' | 'Parent' | 'Élève';

// Le mot-clé (ou "clé de métadonnées") que le RolesGuard lira
export const ROLES_KEY = 'roles';

// Décorateur qui permet de définir les rôles autorisés sur une route
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
