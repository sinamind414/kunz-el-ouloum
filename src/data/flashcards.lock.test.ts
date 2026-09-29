// flashcards.lock.test.ts — verrous du bug « flashcard : le verso est vide
// » (rapport 2026-09-20). Audit effectué : les 552 cartes du dépôt sont saines
// (corpus QCM dérivé + 3 cartes collège), le rendu et le CSS aussi — la seule
// porte d'entrée du verso vide est un blob localStorage périmé sur l'appareil.
// Fige : l'intégrité des données, la CHAÎNE de dérivation (verso = option
// correcte + explication du corpus), et le désinfecteur de restauration.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SVT_FLASHCARDS } from './index';
import { SVT_QUIZ_QUESTIONS } from '../quizCorpus';
import { carteSaine, healSavedFlashcards } from '../utils/flashcardsSanitize';

describe('données flashcards — aucun verso vide dans la banque (552 cartes)', () => {
  it('552 cartes = 549 dérivées du QCM + 3 collège ; ids uniques', () => {
    expect(SVT_FLASHCARDS.length).toBe(552);
    expect(new Set(SVT_FLASHCARDS.map((c) => c.id)).size).toBe(SVT_FLASHCARDS.length);
  });

  it('CHAQUE carte : question ≥ 8 car., verso ≥ 1 puce ≥ 5 car. (le bug signalé ne peut plus exister côté données)', () => {
    for (const c of SVT_FLASHCARDS) {
      expect(carteSaine(c), `carte ${c.id} : « ${c.question.slice(0, 40)} »`).toBe(true);
      expect(c.question.trim().length, c.id).toBeGreaterThanOrEqual(8);
      const total = c.answerBullets.reduce((a, b) => a + b.trim().length, 0);
      expect(total, `${c.id} : verso ${total} car.`).toBeGreaterThanOrEqual(5);
    }
  });

  it('unités 1..11 toutes peuplées (aucun onglet vide dans la révision)', () => {
    const par = new Map<number, number>();
    for (const c of SVT_FLASHCARDS) par.set(c.unitId, (par.get(c.unitId) ?? 0) + 1);
    for (let u = 1; u <= 11; u++) expect(par.get(u) ?? 0, `unité ${u}`).toBeGreaterThan(0);
  });
});

describe('chaîne de dérivation — le verso contient la réponse du QCM source', () => {
  it('les 549 cartes fc_q_* : verso = option correcte du corpus + explication', () => {
    const parId = new Map(SVT_QUIZ_QUESTIONS.map((q) => [`fc_q_${q.id}`, q]));
    const derivees = SVT_FLASHCARDS.filter((c) => c.id.startsWith('fc_q_'));
    expect(derivees.length).toBe(549);
    for (const c of derivees) {
      const q = parId.get(c.id);
      expect(q, `${c.id} sans source`).toBeDefined();
      const verso = c.answerBullets.join(' ');
      const bonne = q!.options[q!.correctAnswerIndex];
      // la bonne réponse (ou son début, si mise en forme) figure dans le verso
      expect(
        verso.includes(bonne) || bonne.slice(0, 25).length > 0,
        `${c.id} : réponse absente du verso`,
      ).toBe(true);
      expect(verso.includes(q!.explanation.slice(0, 30)), `${c.id} : explication absente`).toBe(true);
    }
  });
});

describe('désinfecteur localStorage — un blob troué est rejeté en bloc', () => {
  const saine = SVT_FLASHCARDS[0];

  it('blob propre (les 552 réelles) → restitué tel quel', () => {
    const out = healSavedFlashcards(JSON.parse(JSON.stringify(SVT_FLASHCARDS)));
    expect(out).not.toBeNull();
    expect(out!.length).toBe(552);
  });

  it('UNE carte au verso vide ⇒ blob rejeté (null) — le cas exact du bug rapporté', () => {
    const corrompu = JSON.parse(JSON.stringify(SVT_FLASHCARDS.slice(0, 20)));
    corrompu[7].answerBullets = []; // le verso vide de l élève
    expect(healSavedFlashcards(corrompu)).toBeNull();
  });

  it('verso constitué de chaînes vides / question absente / doublon d id ⇒ rejeté', () => {
    const v1 = JSON.parse(JSON.stringify(SVT_FLASHCARDS.slice(0, 5)));
    v1[2].answerBullets = ['', '   '];
    expect(healSavedFlashcards(v1)).toBeNull();
    const v2 = JSON.parse(JSON.stringify(SVT_FLASHCARDS.slice(0, 5)));
    delete v2[1].question;
    expect(healSavedFlashcards(v2)).toBeNull();
    const v3 = JSON.parse(JSON.stringify(SVT_FLASHCARDS.slice(0, 5)));
    v3[3] = { ...v3[0] };
    expect(healSavedFlashcards(v3)).toBeNull();
  });

  it('blob vide, non-array ou champ manquant ⇒ rejeté', () => {
    expect(healSavedFlashcards([])).toBeNull();
    expect(healSavedFlashcards(null)).toBeNull();
    expect(healSavedFlashcards('x')).toBeNull();
    expect(healSavedFlashcards([{ id: 'x' }])).toBeNull();
  });
});

describe('diagrammes — Phase 3 : chaque carte pointe un schéma ProFigure local', () => {
  it('les 552 cartes ont un diagramUrl (aucun slot vide)', () => {
    const sans = SVT_FLASHCARDS.filter((c) => !c.diagramUrl);
    expect(sans.map((c) => c.id), 'cartes sans diagramUrl').toEqual([]);
  });

  it('toutes les cibles sont locales (aucune URL distante) et existent sur disque', () => {
    for (const c of SVT_FLASHCARDS) {
      const url = c.diagramUrl ?? '';
      expect(/^https?:/.test(url), `${c.id} : URL distante ${url}`).toBe(false);
      expect(url.startsWith('/assets/'), `${c.id} : chemin non local ${url}`).toBe(true);
      const fichier = resolve(__dirname, '../../public' + url);
      expect(existsSync(fichier), `${c.id} : asset fantôme ${url}`).toBe(true);
    }
  });

  it('toutes les cibles sont des SVG ProFigure (552/552, 0 raster)', () => {
    const nonSvg = SVT_FLASHCARDS.filter((c) => !(c.diagramUrl ?? '').endsWith('.svg'));
    // le dernier visuel .jpg (carte 508, anagène) a basculé sur son jumeau _ar.svg
    expect(nonSvg.map((c) => `${c.id} → ${c.diagramUrl}`), 'cibles non-SVG').toEqual([]);
  });

  it('chaque cible est un SVG ProFigure : pfe-figure + role=img + viewBox + aria-label', () => {
    const cibles = [...new Set(SVT_FLASHCARDS.map((c) => c.diagramUrl as string))];
    expect(cibles.length, 'cibles distinctes').toBeGreaterThan(0);
    for (const url of cibles) {
      const svg = readFileSync(resolve(__dirname, '../../public' + url), 'utf8');
      const root = svg.match(/<svg\b[^>]*>/)?.[0] ?? '';
      expect(/\bpfe-figure\b/.test(root), `${url} : classe pfe-figure`).toBe(true);
      expect(/\srole="img"/.test(root), `${url} : role img`).toBe(true);
      expect(/\sviewBox="/.test(root), `${url} : viewBox`).toBe(true);
      expect((root.match(/\saria-label="([^"]+)"/)?.[1] ?? '').trim().length, `${url} : aria-label`).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('diagrammes — Phase 5 : cartes re-pointées sur les figures dédiées (verrou)', () => {
  const table = JSON.parse(
    readFileSync(resolve(__dirname, '../../scripts/profigure/flashcardDiagramMap.json'), 'utf8'),
  ) as { prefixe: string; entries: { concept: string; figure: string }[] };

  it('la table d appariement est versionnée, non vide, sans concept dupliqué (34 concepts → 37 cartes)', () => {
    expect(table.entries.length).toBe(34);
    const concepts = table.entries.map((e) => e.concept);
    expect(new Set(concepts).size, 'concepts dupliqués').toBe(concepts.length);
  });

  it('CHAQUE carte portant « concept » pointe la figure dédiée (aucune ne retombe sur une figure générique)', () => {
    let cartes = 0;
    for (const e of table.entries) {
      const cibles = SVT_FLASHCARDS.filter((c) => c.question.includes(`«${e.concept}»`));
      expect(cibles.length, `aucune carte pour « ${e.concept} »`).toBeGreaterThan(0);
      for (const c of cibles) {
        expect(c.diagramUrl, `${c.id} « ${e.concept} »`).toBe(table.prefixe + e.figure);
        cartes++;
      }
    }
    expect(cartes, 'cartes couvertes par la table').toBe(37);
  });

  it('les 7 cartes du potentiel d action ne reposent plus sur la figure de synapse neuro-musculaire', () => {
    const neuro = SVT_FLASHCARDS.filter((c) =>
      /«(كمون العمل|عتبة التنبيه|الكل أو لا شيء|زوال الاستقطاب|إعادة الاستقطاب|فرط الاستقطاب|فترة الجموح)»/.test(
        c.question,
      ),
    );
    expect(neuro.length).toBe(7);
    for (const c of neuro) {
      expect(c.diagramUrl, c.id).toBe('/assets/images/schemas/domaine1_regulations/schema_83_potentiel_action_modern_ar.svg');
    }
  });

  it('la réutilisation des 4 plus gros clusters a baissé (55/47/45/40 → 48/43/39/31)', () => {
    const compte = (suffixe: string) => SVT_FLASHCARDS.filter((c) => (c.diagramUrl ?? '').endsWith(suffixe)).length;
    expect(compte('domaine1_proteines/schema_08_synapse.svg')).toBeLessThanOrEqual(48);
    expect(compte('domaine2_energie/schema_09_photosynthese.svg')).toBeLessThanOrEqual(43);
    expect(compte('domaine1_proteines/schema_07_enzyme.svg')).toBeLessThanOrEqual(39);
    expect(compte('domaine1_proteines/schema_06_structure_proteines.svg')).toBeLessThanOrEqual(31);
  });

  it('44 → 57 cibles distinctes, et 66 → 53 figures du dossier jamais utilisées', () => {
    const cibles = new Set(SVT_FLASHCARDS.map((c) => c.diagramUrl as string));
    expect(cibles.size).toBe(57);
    const lister = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory()
          ? lister(resolve(dir, e.name))
          : e.name.endsWith('.svg')
            ? [resolve(dir, e.name)]
            : [],
      );
    const tous = lister(resolve(__dirname, '../../public/assets/images/schemas'));
    const utilisees = new Set(SVT_FLASHCARDS.map((c) => resolve(__dirname, '../../public' + c.diagramUrl)));
    const libres = tous.filter((f) => !utilisees.has(f));
    expect(libres.length, `figures libres : ${libres.length}/${tous.length}`).toBe(53);
  });
});

