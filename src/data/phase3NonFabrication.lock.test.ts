// Phase 3 / R9 (2026-11-07) — VERROU DE NON-FABRICATION DU CLASSEMENT.
//
// L'audit demande un « classement entre amis ». Le depot a des comptes eleves
// mais AUCUNE relation entre pairs, AUCUNE route de classement et AUCUN score
// comparatif. Fabriquer tout cela inventait des donnees d'eleves : interdit.
// Ce verrou ne fige pas une decision produit (voir
// SPEC_ARBITRAGE_CLASSEMENT_2026-11-07.md) : il empeche qu'un classement
// apparaisse EN SILENCE, sans arbitrage nomme.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const lire = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8');
const serveur = lire('server.ts');
const panneau = lire('src/components/QuizAdaptatif.tsx');

/** Routes HTTP declarees dans server.ts (mesure : 17 routes uniques). */
function routes(): string[] {
  const trouvees: string[] = [];
  for (const m of serveur.matchAll(/app\.(?:get|post|put|delete)\("([^"]+)"/g)) {
    trouvees.push(m[1]);
  }
  return [...new Set(trouvees)];
}

describe('Phase 3 : aucun classement fabrique cote serveur', () => {
  it('le backend existe : ne pas retablir le faux constat « aucun compte eleve »', () => {
    const r = routes();
    expect(r.length).toBeGreaterThanOrEqual(15);
    for (const route of ['/api/auth/register', '/api/student/sync', '/api/teacher/dashboard']) {
      expect(r, route).toContain(route);
    }
  });

  it('0 route de classement, d amis ou de score comparatif', () => {
    for (const route of routes()) {
      expect(route).not.toMatch(/leaderboard|classement|ranking|friends|amis|class|score/i);
    }
    expect(serveur).not.toContain('leaderboard');
    expect(serveur).not.toContain('classement');
  });
});

describe('Phase 3 : le score R9 reste LOCAL et non comparable', () => {
  it('le score est un etat de composant, pas une donnee d eleves', () => {
    expect(panneau).toContain('const [score, setScore] = useState(0)');
    expect(panneau).not.toContain('enregistrerReponseQcm');
    expect(panneau).not.toContain('localStorage');
    expect(panneau).not.toContain('/api/');
    expect(panneau).not.toContain('leaderboard');
    expect(panneau).not.toContain('classement');
  });

  it('aucune notification imposee, aucune seconde voix', () => {
    expect(panneau).not.toContain('Notification.requestPermission');
    expect(panneau).not.toContain('new Notification');
    expect(panneau).not.toContain('CAPITAINE_IDENTITE_AR');
  });

  it('le bilan dit en فصحى qu aucun classement n est conserve', () => {
    expect(panneau).toContain('لا يُحفظ أي ترتيب');
    expect(panneau).toContain('Non vérifiable');
  });
});

describe('Phase 3 : archetype de la decision, pas une decision', () => {
  it('la spec d arbitrage existe et ne choisit aucune issue', () => {
    const spec = lire('SPEC_ARBITRAGE_CLASSEMENT_2026-11-07.md');
    expect(spec).toContain('aucune n\'est choisie ici');
    expect(spec).toContain('Non vérifiable');
    expect(spec).toContain('fichiers protégés');
    expect(spec).toContain('zéro contenu inventé');
  });
});
