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

// H1 APK (2026-10-21) : dans l'APK Capacitor, tout le contenu est DÉJÀ embarqué
// (android/app/src/main/assets/public/) — le Service Worker y serait un
// double-cache redondant (arbitrage A3, CHIFFRAGE_APK_2026-10-20.md). On le
// neutralise côté natif SANS toucher au web, en détectant le bridge Capacitor
// injecté par la WebView (window.Capacitor, absent sur un navigateur classique).
// Aucun import de @capacitor/core : zéro octet ajouté au bundle web.
const estApkCapacitor = typeof (window as { Capacitor?: unknown }).Capacitor !== 'undefined';

if ('serviceWorker' in navigator && import.meta.env.PROD && !estApkCapacitor) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      // Pas de cache-buster (`?v=${Date.now()}`) : il contourne la comparaison
      // d'octets du SW, forçait une réinstallation à CHAQUE visite et
      // re-téléchargeait l'ensemble des caches (~15 Mo). Le versionnage est
      // désormais injecté dans le fichier lui-même (voir public/sw.js,
      // R2 audit externe 2026-10-15) : sw.js ne change d'octets qu'au
      // déploiement d'un build réellement différent.
      .register('/sw.js')
      .catch((err) => console.warn('Service worker non enregistré:', err));
  });
}

// DÉSENREGISTREMENT EN DÉVELOPPEMENT (correctif 2026-10-13).
//
// BUG RÉEL, diagnostic long : un Service Worker enregistré sur cette origine
// (lors d'une session `npm start`, qui sert dist/ en mode PROD) RESTE actif en
// développement. `import.meta.env.PROD` ne commande que l'enregistrement, jamais
// la désinscription. Le SW interceptait alors les requêtes du serveur dev et,
// via `staleWhileRevalidate` (public/sw.js:242), servait `/src/*.tsx` — donc
// l'ANCIENNE interface — malgré un serveur à jour.
//
// Pourquoi c'est resté invisible côté outillage : toute vérification hors
// navigateur (curl, Invoke-WebRequest, Node) ne traverse pas le Service Worker
// et voyait donc toujours le code frais. Seul le navigateur était trompé.
//
// Correctif : en DEV on désenregistre tout SW résiduel ET on purge ses caches,
// pour que la prochaine charge reparte du réseau.
if ('serviceWorker' in navigator && !import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) void reg.unregister();
    });
    if ('caches' in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          if (key.startsWith('kunz-offline-web')) void caches.delete(key);
        }
      });
    }
  });
}
