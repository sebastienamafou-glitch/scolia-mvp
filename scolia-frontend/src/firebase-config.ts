import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// Collez ici votre config récupérée à l'étape 1
const firebaseConfig = {
  apiKey: "AIzaSyCa4pOY9hOzmU9lauKaSwbJVac5glxFJGw",
  authDomain: "scolia-app.firebaseapp.com",
  projectId: "scolia-app",
  storageBucket: "scolia-app.firebasestorage.app",
  messagingSenderId: "184582371126",
  appId: "1:184582371126:web:829bba49d08bf5c3692597",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, { 
        vapidKey: "BPbPsMUNIgKIZpVj8yFErhnodaR0yuAB2vuH5MjSvgemhwjdQs2sI-TuBcli4Uck34fdOur9nuCS0vmY5ZcPXQo" // La clé générée dans la console Firebase
    });
    if (currentToken) {
      return currentToken;
    } else {
      console.log('Pas de token reçu.');
      return null;
    }
  } catch (err) {
    console.log('Erreur récupération token', err);
    return null;
  }
};
