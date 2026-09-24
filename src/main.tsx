import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    // F3 — zéro query string : le hash de build est DANS les octets de /sw.js
    // (plugin vite). `?v=Date.now()` ne changeait pas les octets → le navigateur
    // ne réinstallait jamais le SW (audit F3).
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.warn('Service worker non enregistré:', err));
  });
}
