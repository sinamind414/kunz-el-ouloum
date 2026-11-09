// Verrous R5 (2026-11-07) : découpage des chunks en micro-leçons et
// synthèse « 3 phrases ». L'exigence centrale est ZÉRO CONTENU INVENTÉ.
// Recalibré 2026-11-08 sur le corpus réel de cette branche : 29 leçons actives
// (+2) → 578 chunks (+16) contre 562 ; 76 leçons, 221 micro-leçons,
// synthèse 54 ancre / 22 extrait / 0 absente (mesures `npx tsx`, 2026-11-08).

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  AVERTISSEMENT_MICRO_AR,
  CHUNKS_PAR_MICRO,
  DUREE_MAX_MICRO_MIN,
  construireLeconsDecoupees,
  statsMicroLecons,
  microLeconsPour,
} from './microLecons';
import { LESSON_INDEX, LESSON_INDEX_STATS } from './lessonIndex';
import { RESUMES_LECONS } from './resumesLecons';

// Le module de production est PUR : c'est le TEST qui fournit l'index, comme
// le fait `lessonIndexRuntime` en production via dist/tutor/lesson-index.json.
const LECONS_DECOUPEES = construireLeconsDecoupees(LESSON_INDEX);
const STATS_MICRO_LECONS = statsMicroLecons(LECONS_DECOUPEES);

const TOUS_TEXTES = new Set(LESSON_INDEX.map((c) => c.text));
const TOUS_TITRES = new Set(LESSON_INDEX.map((c) => c.title));
const PAR_ID = new Map(LESSON_INDEX.map((c) => [c.id, c]));

describe('R5 : couverture exhaustive des 578 chunks', () => {
  it('76 leçons, 578 chunks, aucun chunk perdu ni dupliqué', () => {
    expect(LESSON_INDEX_STATS.chunksTotal).toBe(578);
    expect(STATS_MICRO_LECONS.lecons).toBe(76);
    expect(STATS_MICRO_LECONS.chunks).toBe(578);
    const emis = LECONS_DECOUPEES.flatMap((l) => l.microLecons.flatMap((m) => m.chunkIds));
    expect(emis).toHaveLength(578);
    expect(new Set(emis).size).toBe(578);
    expect([...new Set(emis)].sort()).toEqual(LESSON_INDEX.map((c) => c.id).sort());
  });

  it('chaque micro-leçon porte des titres et textes VERBATIM', () => {
    for (const lecon of LECONS_DECOUPEES) {
      for (const micro of lecon.microLecons) {
        expect(micro.chunkIds.length).toBe(micro.titres.length);
        expect(micro.chunkIds.length).toBe(micro.textes.length);
        expect(micro.chunkIds.length).toBeGreaterThan(0);
        expect(micro.chunkIds.length).toBeLessThanOrEqual(CHUNKS_PAR_MICRO + 2);
        micro.chunkIds.forEach((id, i) => {
          const source = PAR_ID.get(id)!;
          expect(source).toBeTruthy();
          expect(micro.textes[i]).toBe(source.text);
          expect(micro.titres[i]).toBe(source.title);
          expect(TOUS_TEXTES.has(micro.textes[i])).toBe(true);
          expect(TOUS_TITRES.has(micro.titres[i])).toBe(true);
          expect(source.lessonKey).toBe(lecon.lessonKey);
        });
        expect(micro.caracteres).toBe(micro.textes.reduce((s, t) => s + t.length, 0));
      }
    }
  });
});

describe('R5 : durées — aucune valeur fabriquée', () => {
  it('≤ 10 min partout où une durée est déclarée', () => {
    expect(DUREE_MAX_MICRO_MIN).toBe(10);
    expect(STATS_MICRO_LECONS.dureeMaxMicro).toBeLessThanOrEqual(10);
    for (const lecon of LECONS_DECOUPEES) {
      for (const micro of lecon.microLecons) {
        if (lecon.dureeDeclareeMinutes === null) {
          // « Non vérifiable » : aucun chiffre inventé.
          expect(micro.minutes).toBeNull();
        } else {
          expect(micro.minutes).not.toBeNull();
          expect(micro.minutes!).toBeGreaterThan(0);
          expect(micro.minutes!).toBeLessThanOrEqual(10);
        }
      }
    }
  });

  it('seules les durées 20 / 25 déclarées par le cours sont reconnues', () => {
    const declarees = LECONS_DECOUPEES.map((l) => l.dureeDeclareeMinutes).filter(
      (d): d is number => d !== null,
    );
    expect(declarees.length).toBe(25);
    expect([...new Set(declarees)].sort((a, b) => a - b)).toEqual([20, 25]);
    expect(STATS_MICRO_LECONS.leconsSansDureeDeclaree).toBe(51);
  });

  it('les temps d\'expérience (120 دقيقة, 3 دقائق…) ne sont jamais pris pour une durée de cours', () => {
    const premiere = LECONS_DECOUPEES.find((l) => l.lessonKey === 'phase1_chapitres_1_2')!;
    expect(premiere.dureeDeclareeMinutes).toBe(25);
    expect(premiere.microLecons.every((m) => (m.minutes ?? 99) <= 10)).toBe(true);
  });

  it('l\'avertissement affiché distingue interprétation et « Non vérifiable »', () => {
    expect(AVERTISSEMENT_MICRO_AR).toContain('INTERPRÉTATION');
    expect(AVERTISSEMENT_MICRO_AR).toContain('Non vérifiable');
    expect(AVERTISSEMENT_MICRO_AR).toContain('مقتبسة حرفياً');
  });
});

describe('R5 : synthèse « 3 phrases »', () => {
  it('3 phrases pour les 76 leçons, sans aucune synthèse vide', () => {
    expect(STATS_MICRO_LECONS.syntheseAbsente).toBe(0);
    expect(STATS_MICRO_LECONS.syntheseAncre).toBe(54);
    expect(STATS_MICRO_LECONS.syntheseExtrait).toBe(22);
    for (const lecon of LECONS_DECOUPEES) {
      expect(lecon.synthese.phrases).toHaveLength(3);
      for (const p of lecon.synthese.phrases) expect(p.length).toBeGreaterThan(20);
    }
  });

  it('les 54 synthèses ancrées reprennent MOT POUR MOT RESUMES_LECONS', () => {
    const ancrees = LECONS_DECOUPEES.filter((l) => l.synthese.source === 'resume-ancre');
    for (const lecon of ancrees) {
      const resume = RESUMES_LECONS[lecon.lessonKey];
      expect(resume).toBeTruthy();
      expect(lecon.synthese.phrases).toEqual([
        resume!.objectif,
        resume!.points[0],
        resume!.points[1],
      ]);
    }
  });

  it('les 22 extraits sont des SOUS-CHAÎNES des chunks de leur leçon', () => {
    const extraits = LECONS_DECOUPEES.filter((l) => l.synthese.source === 'extrait-cours');
    for (const lecon of extraits) {
      const textes = lecon.microLecons.flatMap((m) => m.textes).join(' ');
      for (const phrase of lecon.synthese.phrases) {
        expect(textes).toContain(phrase);
      }
    }
  });
});

describe('accès', () => {
  it('microLeconsPour() répond null pour une leçon inexistante', () => {
    expect(microLeconsPour(LECONS_DECOUPEES, 'zzz_lecon_inexistante')).toBeNull();
  });
  it('microLeconsPour() retrouve une leçon réelle', () => {
    const l = microLeconsPour(LECONS_DECOUPEES, 'phase1_chapitres_1_2', 'html');
    expect(l?.nbChunks).toBeGreaterThan(0);
    expect(l?.microLecons.length).toBeGreaterThan(1);
  });
});

describe('R5 : source unique — l index ne voyage PAS en JavaScript', () => {
  const source = readFileSync(resolve(__dirname, 'microLecons.ts'), 'utf8');

  it('import TYPE uniquement, aucun import de valeur de lessonIndex', () => {
    expect(source).toContain("import type { LessonIndexChunk } from './lessonIndex'");
    expect(source).not.toMatch(/^import\s*\{[^}]*LESSON_INDEX/m);
    expect(source).not.toContain('lhx_');
  });

  it('le constructeur est pur et accepte une liste vide sans fabriquer de donnée', () => {
    expect(construireLeconsDecoupees([])).toEqual([]);
    expect(statsMicroLecons([]).lecons).toBe(0);
    expect(statsMicroLecons([]).dureeMaxMicro).toBe(0);
  });
});
