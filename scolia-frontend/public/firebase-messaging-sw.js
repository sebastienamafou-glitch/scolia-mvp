// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

firebase.initializeApp({
  // Recollez votre config ici aussi (le Service Worker tourne à part)
  apiKey: "AIzaSyCa4pOY9hOzmU9lauKaSwbJVac5glxFJGw",
  projectId: "scolia-app",
  messagingSenderId: "184582371126",
  appId: "1:184582371126:web:829bba49d08bf5c3692597",
});

const messaging = firebase.messaging();

// Gérer les notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
