// scolia-frontend/src/types/userRole.ts

// Utilisation de 'as const' pour la compatibilité moderne (Vite, esbuild)
// Cela crée un objet JavaScript standard en lecture seule.
export const UserRole = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  TEACHER: 'Enseignant',
  PARENT: 'Parent',
  STUDENT: 'Élève',
} as const;

// Création automatique du Type TypeScript basé sur les valeurs de l'objet ci-dessus
// Équivalent à : type UserRole = 'SuperAdmin' | 'Admin' | 'Enseignant' | 'Parent' | 'Élève';
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
