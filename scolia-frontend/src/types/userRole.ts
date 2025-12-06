// scolia-frontend/src/types/userRole.ts

export const UserRole = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  TEACHER: 'Enseignant',  // ✅ Correct (Match avec le backend)
  PARENT: 'Parent',       // ✅ Correct (Match avec le backend)
  STUDENT: 'Student',     // ⚠️ CORRECTION : Remplacez 'Élève' par 'Student'
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
