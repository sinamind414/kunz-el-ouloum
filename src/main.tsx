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
// double-cache redondant (arbitrage A3, docs/rapports/CHIFFRAGE_APK_2026-10-20.md). On le
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

// ============================================================
// BOUTON RETOUR ANDROID (H2, 23/10/2026 — audit ARTEMIS + demande
// explicite : « le retour matériel quitte l'app »).
// Le plugin @capacitor/app est chargé UNIQUEMENT dans l'APK
// (dynamic import derrière estApkCapacitor → chunk séparé jamais
// téléchargé sur le web). Sémantique du retour matériel :
//   1. la WebView a un historique → history.back() ;
//   2. une modale/panneau est ouvert (bouton إغلاق visible) → on
//      clique CE bouton, exactement comme le ferait l'élève ;
//   3. un bouton عودة est visible (retour in-app) → on le clique ;
//   4. sinon (racine) → TOAST + double-retour < 2 s pour quitter.
// L'app est une SPA à état pur (aucun pushState) : piloter les
// mêmes boutons que l'élève est fidèle ET évite de toucher à
// App.tsx (fichier protégé — travail concurrent non signé).
// ============================================================
if (estApkCapacitor) {
  void import('@capacitor/app').then(({ App: CapApp }) => {
    let dernierRetour = 0;

    /** Visible à l'écran (rendu, non masqué, dans le viewport). */
    const visible = (el: Element): boolean => {
      const h = el as HTMLElement;
      if (h.offsetParent === null && getComputedStyle(h).position !== 'fixed') return false;
      const r = h.getBoundingClientRect();
      return (
        r.width > 0 &&
        r.height > 0 &&
        r.bottom > 0 &&
        r.top < (window.innerHeight || document.documentElement.clientHeight)
      );
    };

    /** Premier bouton/action visible dont le libellé (aria-label ou
        texte) satisfait `test`. `aria-label` d'abord : les boutons
        icône (✕) n'ont pas de texte. */
    const trouverAction = (test: (label: string) => boolean): HTMLElement | null => {
      for (const b of document.querySelectorAll<HTMLElement>('button, a, [role="button"]')) {
        const label = (b.getAttribute('aria-label') || b.textContent || '').trim();
        if (label && test(label) && visible(b)) return b;
      }
      return null;
    };

    const toastRetour = () => {
      document.getElementById('kunz-toast-retour')?.remove();
      const t = document.createElement('div');
      t.id = 'kunz-toast-retour';
      t.dir = 'rtl';
      t.textContent = 'اضغط رجوعًا مرة أخرى للخروج';
      t.style.cssText =
        'position:fixed;bottom:12%;left:50%;transform:translateX(-50%);z-index:9999;' +
        'background:rgba(20,25,22,0.92);color:#fff;padding:10px 18px;border-radius:999px;' +
        'font-weight:700;font-size:13px;box-shadow:0 4px 14px rgba(0,0,0,0.35);' +
        'transition:opacity .25s;pointer-events:none;';
      document.body.appendChild(t);
      window.setTimeout(() => { t.style.opacity = '0'; }, 1600);
      window.setTimeout(() => { t.remove(); }, 2100);
    };

    void CapApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) { window.history.back(); return; }
      const fermer = trouverAction((l) => l.startsWith('إغلاق'));
      if (fermer) { fermer.click(); return; }
      const retour = trouverAction((l) => l.includes('عودة'));
      if (retour) { retour.click(); return; }
      const maintenant = Date.now();
      if (maintenant - dernierRetour < 2000) { void CapApp.exitApp(); return; }
      dernierRetour = maintenant;
      toastRetour();
    });
  });
}
