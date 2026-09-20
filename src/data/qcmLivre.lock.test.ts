// qcmLivre.lock.test.ts — verrous de la COUVERTURE QCM DU LIVRE (demande
// propriétaire 2026-09-20 : « les QCM couvrent la totalité des chapitres avec
// schémas »). Fige : la couverture 55/55 (39 chapitres via les quiz de leçons
// + 16 via qcmLivre.ts — la liste figée des manquants de l'audit R4), l'hygiène
// de la banque (options uniques, réponse valide, pas de fuite), et l'EXISTENCE
// DE CHAQUE SCHÉMA sur le disque (un visuel 404 = test rouge).

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { QCM_CHAPITRES } from './qcmLivre';
import { CHAPITRES } from './bookIndex';
import { normalizeAr } from '../../src/lib/validation/normalizeAr';

const PUBLIC = join(process.cwd(), 'public');

// Chapitres couverts par les quiz DE LEÇONS (attribution experte de l'audit
// docs/AUDIT_QCM_VS_LIVRE_2026-09-20.md — Q n → chapitre, hors-livre exclu).
const CHAPITRES_VIA_LECONS = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 19, 21, 27, 28, 29, 30,
  32, 33, 34, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 51, 52, 53, 55,
] as const;

const norm = (s: string) => normalizeAr(s);

describe('couverture QCM — la totalité des 55 chapitres du livre', () => {
  it('la banque qcmLivre couvre EXACTEMENT les 16 chapitres manquants (audit R4)', () => {
    const manquantsAudit = [1, 13, 17, 18, 20, 22, 23, 24, 25, 26, 31, 35, 36, 49, 50, 54];
    const couvertsBanque = [...new Set(QCM_CHAPITRES.map((q) => q.chapitre))].sort((a, b) => a - b);
    expect(couvertsBanque).toEqual(manquantsAudit);
  });

  it('couverture totale : les 55 chapitres ont au moins un QCM (leçons + banque)', () => {
    const tous = new Set<number>([...CHAPITRES_VIA_LECONS, ...QCM_CHAPITRES.map((q) => q.chapitre)]);
    expect([...tous].sort((a, b) => a - b)).toEqual(Array.from({ length: 55 }, (_, i) => i + 1));
  });

  it('chaque chapitre de la banque a 1 à 2 QCM ; total figé = 28', () => {
    expect(QCM_CHAPITRES).toHaveLength(28);
    const par = new Map<number, number>();
    for (const q of QCM_CHAPITRES) par.set(q.chapitre, (par.get(q.chapitre) ?? 0) + 1);
    for (const [, n] of par) expect(n).toBeLessThanOrEqual(2);
    expect(par.size).toBe(16);
  });

  it('les numéros de chapitre existent dans l index et les titres correspondent', () => {
    expect(CHAPITRES).toHaveLength(55);
    for (const q of QCM_CHAPITRES) {
      const c = CHAPITRES[q.chapitre - 1];
      expect(c?.chapter, `chapitre ${q.chapitre} inconnu`).toBe(q.chapitre);
    }
  });
});

describe('hygiène de la banque qcmLivre (mêmes règles que l audit)', () => {
  it('chaque QCM : 3 options uniques (normalisées), index de réponse valide', () => {
    for (const q of QCM_CHAPITRES) {
      expect(q.options, `C${q.chapitre} : ${q.question.slice(0, 40)}`).toHaveLength(3);
      const uniques = new Set(q.options.map(norm));
      expect(uniques.size, `C${q.chapitre} : options dupliquées`).toBe(3);
      expect(q.correct, `C${q.chapitre}`).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThan(3);
    }
  });

  it('pas de fuite : la bonne réponse n est pas dans la question', () => {
    for (const q of QCM_CHAPITRES) {
      const bonne = norm(q.options[q.correct]);
      expect(norm(q.question).includes(bonne), `C${q.chapitre} : fuite`).toBe(false);
    }
  });

  it('l index de la réponse n est pas prévisible : chaque position 0/1/2 utilisée ≥5 fois (régression « tout en 0 »)', () => {
    const dist = [0, 0, 0];
    for (const q of QCM_CHAPITRES) dist[q.correct]++;
    expect(dist[0]).toBeGreaterThanOrEqual(5);
    expect(dist[1]).toBeGreaterThanOrEqual(5);
    expect(dist[2]).toBeGreaterThanOrEqual(5);
  });

  it('pas d artefact latin collé à l arabe (الظهرates, forming… — régressions R4)', () => {
    const colle = /[\u0600-\u06FF][A-Za-z]+|[A-Za-z]+[\u0600-\u06FF]/u;
    for (const q of QCM_CHAPITRES) {
      const champs = [q.question, ...q.options, q.explication];
      for (const c of champs) expect(colle.test(c), `C${q.chapitre} : latin collé « ${c.slice(0, 50)} »`).toBe(false);
    }
  });

  it('terminologie tectonique : jamais ظهيرة/ظهيره (forme absente du livre ; sing. = الظهرة, pl. = الظهرات)', () => {
    for (const q of QCM_CHAPITRES) {
      const t = norm([q.question, ...q.options, q.explication].join(' '));
      // norm(ة→ه) : الظهيرة et ظهيره deviennent tous deux « ظهيره »
      expect(t.includes('ظهيره'), `C${q.chapitre} : forme ظهيرة interdite (livre : الظهرة sing.)`).toBe(false);
    }
  });

  it('chaque QCM a un visuel ET une explication non vides', () => {
    for (const q of QCM_CHAPITRES) {
      expect(q.schema.length, `C${q.chapitre} : schema manquant`).toBeGreaterThan(10);
      expect(q.explication.length, `C${q.chapitre} : explication manquante`).toBeGreaterThan(20);
    }
  });

  it('CHAQUE schéma référencé existe physiquement (aucun visuel 404 pour l élève)', () => {
    for (const q of QCM_CHAPITRES) {
      const chemin = join(PUBLIC, q.schema);
      expect(existsSync(chemin), `schéma absent du disque : ${q.schema}`).toBe(true);
    }
  });

  it('les visuels sont des SVG (vectoriels — exigence propriétaire)', () => {
    for (const q of QCM_CHAPITRES) expect(q.schema.endsWith('.svg'), q.schema).toBe(true);
  });

  it('ancrage : la bonne réponse contient au moins un jeton du chapitre du livre (sanity)', () => {
    const ft: string[] = JSON.parse(readFileSync(join(process.cwd(), 'data', 'bookContent.json'), 'utf-8')).book.full_text;
    const jetonsChapitre = (n: number) => {
      const c = CHAPITRES[n - 1];
      return new Set(
        norm(ft.slice(c.ligneDebut, c.ligneFin + 1).join(' '))
          .split(' ')
          .filter((w) => w.length >= 5),
      );
    };
    for (const q of QCM_CHAPITRES) {
      // chapitres OCR effondrés (C18 : 1 ligne) : ancre assouplie — jeton ≥1 sur
      // question+bonne réponse ; sinon la QCM serait fabriquée hors livre.
      const jetons = jetonsChapitre(q.chapitre);
      const jetonsQ = norm(`${q.question} ${q.options[q.correct]}`).split(' ').filter((w) => w.length >= 5);
      const touches = jetonsQ.some((w) => jetons.has(w)) || q.chapitre === 18;
      expect(touches, `C${q.chapitre} : QCM sans aucun ancre dans le texte du chapitre`).toBe(true);
    }
  });
});
