// statsJoursSerieux.lock.test.ts — VERROU DE CÂBLAGE R2 (audit coach
// 2026-11-06, GO propriétaire en session — version douce).
//
// Ce que ce fichier empêche de régresser : le drapeau « jour sérieux »
// (mesure QUALITATIVE, DISTINCTE de la série) doit rester ACCROCHÉ aux stats.
// Le défaut d'origine : la série disait « N أيام مستمرة 🔥 » même pour un
// jour produit d'un seul clic — une assiduité de façade invisible.
//
// Pourquoi un verrou SOURCE (lecture du texte de StatsView.tsx) : le composant
// monte un canvas partagé et un harness complet — le garder hors du rendu de
// test unitaire est le choix documenté du dépôt (cf. tc2Brancher.lock.test.ts).
// Le greffon minimum est le texte lui-même ; tout retrait accidentel de l'un
// des trois fils (testid, import, source du helper) fait tomber ce fichier.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SOURCE_STATS = readFileSync(
  join(process.cwd(), 'src', 'components', 'StatsView.tsx'),
  'utf8',
);
const SOURCE_HELPER = readFileSync(
  join(process.cwd(), 'src', 'utils', 'activiteQuotidienne.ts'),
  'utf8',
);

describe('R2 — la pastille « jour sérieux » reste câblée aux stats', () => {
  it('StatsView porte le testid dédié (affichage isolé de la série 🔥)', () => {
    expect(SOURCE_STATS).toContain('data-testid="stats-jours-serieux"');
  });

  it('StatsView lit bilanJoursSerieux (et le reçoit toujours du helper)', () => {
    expect(SOURCE_STATS).toContain('bilanJoursSerieux');
  });

  it('le helper reste exporté avec le critère MESURÉ (`history` + `completed`)', () => {
    // Le critère est verrouillé au mot : un « jour sérieux » est un fait
    // (objectif du jour atteint), jamais un seuil inventé par le code.
    expect(SOURCE_HELPER).toContain('export function bilanJoursSerieux');
    expect(SOURCE_HELPER).toContain('export interface BilanJoursSerieux');
    // La lecture ne s'étend à AUCUNE autre source : ce commentaire interdit
    // explicitement d'ajouter un seuil d'opinion au critère.
    expect(SOURCE_HELPER).toContain('j.completed === true');
  });

  it('la série reste le SEUL déclencheur des règles du coach (version douce)', () => {
    // R2 version douce = zéro changement de règle : ce module n'importe ni
    // n'appelle la machine de décision — le bilan n'est qu'un AFFICHAGE stats.
    expect(SOURCE_HELPER).toContain("aucune règle d'invitation");
    expect(SOURCE_HELPER).not.toContain('invitationCapitaine');
  });
});
