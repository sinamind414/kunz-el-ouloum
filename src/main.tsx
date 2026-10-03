import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import FigureZoomLayer from './components/FigureZoomLayer';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Zoom des figures : monté UNE fois, HORS de tout branchement conditionnel.
        App.tsx comporte cinq `return` anticipés (splash, quiz, portails d'unité,
        épreuve BAC) qui court-circuiteraient un montage posé dans son rendu
        principal. Ici la couche vit aussi longtemps que l'application.
        Même runtime que les 25 leçons HTML → un seul comportement partout. */}
    <FigureZoomLayer />
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`/sw.js?v=${Date.now()}`)
      .catch((err) => console.warn('Service worker non enregistré:', err));
  });
}
