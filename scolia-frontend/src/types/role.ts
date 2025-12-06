// scolia-frontend/src/types/role.ts
import { UserRole } from './userRole';

export interface Role {
    id: number;
    name: UserRole; // Utilise le type strict défini dans userRole.ts
}
