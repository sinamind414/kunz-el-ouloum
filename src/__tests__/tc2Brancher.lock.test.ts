// tc2Brancher.lock.test.ts — VERROU DE LA TRANCHES TC2 « BRANCHER »
// (audit coach Morchid 18/10/2026 — H4/H5(a-c)/M3).
//
// Ce que TC2 a réparé, et que ce fichier empêche de régresser :
//
//   H4  « deux cerveaux sans pont » : le chat (smartTutorEngine) ne lisait ni
//       l'état élève ni le دفتر الأخطاء — « راجع أخطائي » ne voyait que la
//       session courante. Désormais le capitaine dépose l'état assemblé dans
//       lib/etatEleveRuntime.ts et le moteur le lit (total réel + motif
//       dominant, jamais un chiffre inventé).
//   H5(a) la bulle restait muette pour une absence ≥ 3 jours sans erreurs —
//       verrou mis à jour dans invitationCapitaine.test.ts (conscient).
//   H5(b/c) StudyReminderModal doublait le capitaine avec un lastStudyTime
//       écrit à l'ouverture, et demandait une permission de Notification sans
//       jamais envoyer de notification. Supprimé (fichier + tout App).
//   M3  la bulle couvrait les boutons du quiz et restait muette pour les
//       lecteurs d'écran : arbitrage d'écran (quiz/défi → silence) +
//       role="status"/aria-live.
//
// Pourquoi des verrous SOURCE (lecture du texte d'App.tsx) : App.tsx est un
// fichier concurrent — on ne peut pas le monter dans un test unitaire sans un
// harness complet ; le greffon minimum pour empêcher la régression, c'est le
// texte lui-même (pratique éprouvée des verrous source du dépôt).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  etatEleveSiChargee,
  fournirEtatEleve,
  reinitialiserEtatEleve,
} from '../lib/etatEleveRuntime';
import {
  ACTIONS_COACH,
  reviewMistakes,
} from '../smartTutorEngine';
import { getDefaultSession } from '../utils/sessionManager';
import type { EtatEleve } from '../lib/etatEleve';

const RACINE = join(__dirname, '..');
const texte = (rel: string) => readFileSync(join(RACINE, rel), 'utf8');

/** État partiel : seule la famille `erreurs` intéresse reviewMistakes ici. */
function etatAvecErreurs(
  total: number,
  dominante: { code: string; occurrences: number } | null,
): EtatEleve {
  return {
    erreurs: {
      chargee: true,
      total,
      dominante,
      capital: { fermees: 0, rouvertes: 0, total },
    },
  } as unknown as EtatEleve;
}

/** Le cas réel mesuré par l'audit : session du chat propre, دفتر porteur. */
function provideEtatAvecErreurs(): void {
  fournirEtatEleve(etatAvecErreurs(7, { code: 'R2', occurrences: 4 }));
}

// ─────────────────────────────────────────────────────────────────────────────
// H5(b/c) — UNE SEULE VOIX DE RAPPEL : LE CAPITAINE.
// ─────────────────────────────────────────────────────────────────────────────
describe('H5(b/c) — le sous-système « StudyReminderModal » ne revient pas', () => {
  it('le fichier du modal est supprimé du dépôt', () => {
    expect(existsSync(join(RACINE, 'components', 'StudyReminderModal.tsx'))).toBe(false);
  });

  it('App.tsx ne connaît plus ni le modal, ni la permission de notification morte', () => {
    const app = texte('App.tsx');
    expect(app).not.toContain('StudyReminderModal');
    expect(app).not.toContain('isReminderModalOpen');
    expect(app).not.toContain('scheduledReminderTime');
    // La demande de permission n'était rebondie par AUCUNE notification réelle.
    // FocusTimer conserve la sienne — légitime (il notifie la fin d'une phase).
    expect(app).not.toContain('Notification.requestPermission');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// M3 — ARBITRAGE D'ÉCRAN + ARIA DE LA PAROLE QUI APPARAÎT.
// ─────────────────────────────────────────────────────────────────────────────
describe('M3 — la bulle ne couvre plus le quiz et est énoncée aux lecteurs d’écran', () => {
  it('la bulle se tait pendant le quiz et pendant un défi ouvert', () => {
    const app = texte('App.tsx');
    expect(app).toContain('activeQuizUnitId === null && activeCombatChallenge === null');
  });

  it('la bulle porte role="status" et aria-live="polite"', () => {
    const app = texte('App.tsx');
    const bulle = app.slice(app.indexOf('data-testid="bulle-capitaine"'));
    expect(bulle.slice(0, 800)).toContain('role="status"');
    expect(bulle.slice(0, 800)).toContain('aria-live="polite"');
  });

  it('le relais humain est énoncé lui aussi', () => {
    const relais = texte('components/RelaisCapitaine.tsx');
    expect(relais).toContain('role="status"');
    expect(relais).toContain('aria-live="polite"');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// H4 — LE CHAT LIT L'ÉTAT ÉLÈVE (fin des deux cerveaux).
// ─────────────────────────────────────────────────────────────────────────────
describe('H4 — le pointeur d’état relie le capitaine au moteur', () => {
  afterEach(() => {
    reinitialiserEtatEleve();
  });

  it('null tant que le capitaine n’a rien déposé — jamais une lecture prétendue', () => {
    reinitialiserEtatEleve();
    expect(etatEleveSiChargee()).toBeNull();
  });

  it('le dépôt est idempotent : le moteur lit toujours le DERNIER assemblage', () => {
    const etat = { phase: 'travail' } as unknown as EtatEleve;
    const plusNet = { phase: 'recuperation' } as unknown as EtatEleve;
    fournirEtatEleve(etat);
    fournirEtatEleve(plusNet);
    expect(etatEleveSiChargee()).toBe(plusNet);
  });

  it('le capitaine dépose bien l’état qu’il a assemblé (câblage du hook)', () => {
    const hook = texte('hooks/useInvitationCapitaine.ts');
    expect(hook).toContain('fournirEtatEleve(etat)');
  });

  it('le moteur consomme le pointeur pour « راجع أخطائي » et le تشخيص', () => {
    const moteur = texte('smartTutorEngine.ts');
    expect(moteur).toContain("from './lib/etatEleveRuntime'");
    // reviewMistakes : le chiffre réel quand la session est vide mais pas le
    // دفتر — la phrase d'origine n'est atteinte qu'en l'absence d'état.
    expect(moteur).toContain('etatEleve.erreurs.chargee && etatEleve.erreurs.total > 0');
    // diagnosticCoach : la vue d'ensemble nomme le دفتر quand il porte des erreurs.
    expect(moteur).toContain('ligneErreursQcm');
  });

  it('« راجع أخطائي » en session vide dit le VRAI total du دفتر — jamais un inventé', () => {
    provideEtatAvecErreurs();
    const r = reviewMistakes(getDefaultSession());
    expect(r.action.text).toContain('7');
    expect(r.action.text).toContain('R2');
    expect(r.action.quickActions).toContain(ACTIONS_COACH.actualiserDiagnostic);
  });

  it('sans état déposé, l’ancien message (borné à « pas encore ») reste — aucune prétention', () => {
    reinitialiserEtatEleve();
    const r = reviewMistakes(getDefaultSession());
    expect(r.action.text).toContain('لا توجد أخطاء مسجلة لديك بعد');
  });

  it('دفتر vide mais CHARGÉ : le message reste celui d’une session propre — sans chiffre falsifié', () => {
    fournirEtatEleve(etatAvecErreurs(0, null));
    const r = reviewMistakes(getDefaultSession());
    expect(r.action.text).toContain('لا توجد أخطاء مسجلة لديك بعد');
  });
});
