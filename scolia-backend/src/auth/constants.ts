// scolia-backend/src/auth/constants.ts

export const jwtConstants = {
  // On utilise la variable d'environnement (définie sur Render)
  // Si elle n'existe pas (en local), on utilise la clé de secours
  secret: process.env.JWT_SECRET || 'VOTRE_CLE_SECRETE_ULTRA_COMPLEXE_DE_32_CARACTERES',
};
