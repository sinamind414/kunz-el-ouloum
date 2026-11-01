// examenEnCours.test.ts — LE VERROU DU SILENCE PENDANT L'ÉPREUVE.
//
// Défaut corrigé le 14/10/2026 : le bouton flottant du guide était rendu quand
// `!isFocusMode && currentTab !== 'chat'`, et RIEN ne réglait `isFocusMode`
// pendant « موضوع تجريبي ». L'élève pouvait donc ouvrir le tuteur en pleine
// épreuve chronométrée et lui demander la réponse.
//
// Ces tests couvrent le signal, et — plus important — le CÂBLAGE réel : un
// signal que personne n'écoute ne corrige rien.
import { describe, expect, it, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  abonnerExamen,
  declarerExamen,
  examenActif,
  reinitialiserExamen,
} from '../examenEnCours';

const lire = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');

beforeEach(() => reinitialiserExamen());

describe('le signal', () => {
  it('est faux au départ (aucune épreuve en cours)', () => {
    expect(examenActif()).toBe(false);
  });

  it('s’active et se désactive', () => {
    declarerExamen(true);
    expect(examenActif()).toBe(true);
    declarerExamen(false);
    expect(examenActif()).toBe(false);
  });

  it('est IDEMPOTENT : deux fois `true` ne notifie qu’une fois', () => {
    // Indispensable : un composant React déclare l'épreuve dans un useEffect et
    // peut être remonté plusieurs fois. Notifier à chaque fois ferait clignoter
    // l'interface.
    let appels = 0;
    abonnerExamen(() => {
      appels += 1;
    });
    declarerExamen(true);
    declarerExamen(true);
    declarerExamen(true);
    expect(appels).toBe(1);
  });

  it('prévient les abonnés dans les deux sens', () => {
    const vus: boolean[] = [];
    abonnerExamen((a) => vus.push(a));
    declarerExamen(true);
    declarerExamen(false);
    expect(vus).toEqual([true, false]);
  });

  it('le désabonnement coupe bien la notification', () => {
    let appels = 0;
    const off = abonnerExamen(() => {
      appels += 1;
    });
    declarerExamen(true);
    off();
    declarerExamen(false);
    expect(appels).toBe(1);
  });

  it('un abonné qui lève n’empêche pas les autres d’être prévenus', () => {
    // Une erreur dans un composant ne doit pas casser l'épreuve en cours.
    const vus: boolean[] = [];
    abonnerExamen(() => {
      throw new Error('composant fautif');
    });
    abonnerExamen((a) => vus.push(a));
    expect(() => declarerExamen(true)).not.toThrow();
    expect(vus).toEqual([true]);
    expect(examenActif()).toBe(true);
  });

  it('plusieurs abonnés sont tous prévenus', () => {
    const vus: string[] = [];
    abonnerExamen(() => vus.push('a'));
    abonnerExamen(() => vus.push('b'));
    declarerExamen(true);
    expect(vus.sort()).toEqual(['a', 'b']);
  });
});

describe('le câblage : un signal que personne n’écoute ne corrige rien', () => {
  it('l’épreuve DÉCLARE son silence au montage et le retire au démontage', () => {
    const src = lire('src/components/MockExamPanel.tsx');
    expect(src).toContain('declarerExamen(true)');
    // Le nettoyage est la moitié du travail : sans lui, le guide resterait muet
    // dans toute l'application après un seul passage par l'épreuve.
    expect(src).toContain('return () => declarerExamen(false)');
  });

  it('App ÉCOUTE le signal (abonnement unique, propre au démontage)', () => {
    const src = lire('src/App.tsx');
    expect(src).toContain('abonnerExamen(setEpreuveEnCours)');
    // L'abonné est retiré au démontage : `abonnerExamen` rend sa fonction d'arrêt
    // et `useEffect` la reçoit comme nettoyage.
    expect(src).toContain('useEffect(() => abonnerExamen(setEpreuveEnCours), [])');
  });

  it('le bouton flottant est conditionné au silence', () => {
    const src = lire('src/App.tsx');
    // On part de la CONDITION, puis on vérifie que le bouton est bien dedans :
    // chercher « fab-morchid » d'abord ne dit pas quelle condition le garde.
    const conditions = [...src.matchAll(/\{!isFocusMode[^\n]*currentTab !== 'chat'[^\n]*&& \(/g)];
    expect(conditions.length, 'la condition du bouton est introuvable').toBeGreaterThan(0);
    for (const c of conditions) {
      // Le bloc gardé contient désormais la BULLE puis le bouton (le bouton a
      // été enveloppé avec la bulle du capitaine) : la fenêtre doit couvrir les
      // deux sans dépasser la fin du bloc conditionnel.
      const bloc = src.slice(c.index!, c.index! + 4000);
      expect(bloc, 'le bouton doit être gardé par cette condition').toContain('fab-morchid');
      expect(bloc, 'la bulle aussi : elle se tait pendant l’épreuve').toContain('bulle-capitaine');
      expect(c[0], 'la raison « épreuve » doit être dans la condition').toContain('!epreuveEnCours');
    }
  });

  it('la condition ORIGINELLE du mode focus est conservée', () => {
    // La correction ne doit pas retirer le masquage existant (mode focus et vue
    // du tuteur lui-même) : on ajoute une raison, on n'en remplace pas une.
    const src = lire('src/App.tsx');
    expect(src).toContain("!isFocusMode && !epreuveEnCours && currentTab !== 'chat'");
  });

  it('l’épreuve EXPLIQUE le silence (sinon cela passe pour une panne)', () => {
    // Une disparition de bouton sans explication fait croire à un bug — et
    // l'élève cherche à contourner. L'explication vient de `capitaine.ts`, donc
    // elle reste alignée sur la voix du guide.
    const src = lire('src/components/MockExamPanel.tsx');
    expect(src).toContain('MESSAGES_CAPITAINE.examenEnCours.ar');
    expect(src).toContain('mock-guide-silencieux');
  });

  it('le silence n’est PAS obtenu à travers le mode focus', () => {
    // Réutiliser `setIsFocusMode` aurait changé la mise en page (barre masquée,
    // contenu centré) : l'examen a besoin de la mise en page normale pour rester
    // lisible sur un petit écran.
    const src = lire('src/components/MockExamPanel.tsx');
    expect(src).not.toContain('setIsFocusMode');
  });
});
