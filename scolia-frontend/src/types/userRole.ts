// scolia-frontend/src/types/userRole.ts

// On utilise 'as const' pour figer les valeurs (lecture seule)
export const UserRole = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  TEACHER: 'Enseignant',
  PARENT: 'Parent',
  STUDENT: 'Élève',
} as const;

// On crée un Type à partir des valeurs de l'objet
// Cela équivaut à : type UserRole = 'SuperAdmin' | 'Admin' | 'Enseignant' ...
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
