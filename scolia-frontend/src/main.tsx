import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // Import du Router
import { AuthProvider } from './contexts/AuthContext'; // Import du AuthProvider

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter> {/* <--- AJOUT CRUCIAL (Le contexte du Router) */}
      <AuthProvider> {/* On s'assure que Auth est chargé en premier */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
