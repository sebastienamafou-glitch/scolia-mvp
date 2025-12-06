// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
    // Liste des fichiers à analyser pour générer le CSS final (purge/content)
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // Définition des couleurs Scolia
            colors: {
                scolia: {
                    blue: '#0A2240',   // Bleu Nuit (Confiance)
                    orange: '#F77F00', // Orange Vif (Action)
                    green: '#008F39',  // Vert Émeraude (Succès)
                    gray: '#F4F6F8',   // Fond gris clair
                }
            },
            // Définition des familles de polices
            fontFamily: {
                // Open Sans pour le corps (font-sans)
                sans: ['Open Sans', 'sans-serif'], 
                // Poppins pour les titres (font-heading)
                heading: ['Poppins', 'sans-serif'],
            }
        }
    },
    plugins: [],
}
