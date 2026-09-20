// qcmBilan.ts — pool unifié du mode « اختبار تشخيصي شامل » (bilan QCM).
// Réutilisation MÉCANIQUE des deux banques déjà verrouillées — ZÉRO contenu nouveau :
//   - 28 QCM de la banque livre (src/data/qcmLivre.ts : chapitre exact, schéma, explication) ;
//   - 50 quiz de leçons (src/lessonData.ts, blocs type 'quiz' — {question, options, correct}).
// Les 3 QCM single-path (format booléen vrai/faux) ne sont pas poolés (autre forme).
// Attribution domaine des leçons : slug → chapitres → bookIndex. Mesuré 2026-09-20 :
// phase21 (ch41-42) contient 0 quiz → aucun chevauchement D2/D3 à arbitrer ;
// representation + activite_structure = noyau D1 (0 quiz hors D1) ; transcription = 0 quiz.
// Répartition du pool : D1=54, D2=14, D3=10 (figée par qcmBilan.lock.test.ts).
// Override phase21 (ch41-42) : ses 2 quiz = الظهرات/الغوص/الأفيوليت → D3, tranché par
// LECTURE du contenu (l'attribution « premier chapitre du slug » donnait D2 à tort).

import { EXPERIMENTAL_LESSONS } from '../lessonData';
import { QCM_CHAPITRES } from './qcmLivre';
import { CHAPITRES } from './bookIndex';

export type Domaine = 1 | 2 | 3;

export interface QcmBilanItem {
  id: string; // 'L:<slug>:<n>' | 'B:<chapitre>:<n>'
  source: 'lecon' | 'livre';
  sourceLabel: string; // slug de la leçon ou « الفصل N »
  domaine: Domaine;
  chapitre?: number; // connu exactement pour la banque livre
  question: string;
  options: string[];
  correct: number;
  schema?: string; // banque livre uniquement
  explication?: string; // banque livre uniquement
}

const domDuChapitre = (c: number): Domaine => (CHAPITRES[c - 1]?.domain ?? 1) as Domaine;

/** Chevauchements slug → domaine tranchés par lecture du contenu (voir en-tête). */
const OVERRIDES_SLUG: Record<string, Domaine> = { phase21_chapitres_41_42: 3 };

function domaineDeSlug(slug: string): Domaine {
  if (OVERRIDES_SLUG[slug]) return OVERRIDES_SLUG[slug];
  const m = slug.match(/chapitres_(\d+)_(\d+)/);
  if (m) return domDuChapitre(Number(m[1]));
  if (slug === 'lecon_transcription') return domDuChapitre(1);
  return domDuChapitre(2); // representation / activite_structure : noyau D1
}

function construirePool(): QcmBilanItem[] {
  const pool: QcmBilanItem[] = [];

  for (const q of QCM_CHAPITRES) {
    pool.push({
      id: `B:${q.chapitre}:${QCM_CHAPITRES.filter((x) => x.chapitre === q.chapitre).indexOf(q) + 1}`,
      source: 'livre',
      sourceLabel: `الفصل ${q.chapitre}`,
      domaine: domDuChapitre(q.chapitre),
      chapitre: q.chapitre,
      question: q.question,
      options: [...q.options],
      correct: q.correct,
      schema: q.schema,
      explication: q.explication,
    });
  }

  for (const [slug, lecon] of Object.entries(EXPERIMENTAL_LESSONS)) {
    let n = 0;
    for (const phase of lecon.phases) {
      for (const bloc of phase.blocks) {
        if (bloc.type !== 'quiz' || !bloc.options) continue;
        n += 1;
        pool.push({
          id: `L:${slug}:${n}`,
          source: 'lecon',
          sourceLabel: slug,
          domaine: domaineDeSlug(slug),
          question: (bloc.question ?? '').replace(/^\d+\.\s*/, ''), // numérotation locale retirée (mécanique)
          options: [...bloc.options],
          correct: bloc.correct ?? 0,
        });
      }
    }
  }

  return pool;
}

export const POOL: QcmBilanItem[] = construirePool();

/** Générateur déterministe (mulberry32) — même graine ⇒ même tirage, testable. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PAR_DOMAINE = 5;

/**
 * Tirage déterministe d'un bilan : 5 QCM par domaine (15 au total), entrelacés
 * D1→D2→D3, sans doublon, ordre reproductible pour une même graine.
 */
export function tirageBilan(seed: number, pool: QcmBilanItem[] = POOL): QcmBilanItem[] {
  const rng = mulberry32(seed);
  const parDomaine = new Map<Domaine, QcmBilanItem[]>();
  for (const d of [1, 2, 3] as Domaine[]) {
    const duDomaine = pool.filter((q) => q.domaine === d);
    // Fisher-Yates déterministe
    for (let i = duDomaine.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [duDomaine[i], duDomaine[j]] = [duDomaine[j], duDomaine[i]];
    }
    parDomaine.set(d, duDomaine.slice(0, Math.min(PAR_DOMAINE, duDomaine.length)));
  }
  const file = (['1', '2', '3'] as const).map((d) => parDomaine.get(Number(d) as Domaine) ?? []);
  const tirage: QcmBilanItem[] = [];
  for (let r = 0; r < PAR_DOMAINE; r++) {
    for (const f of file) if (f[r]) tirage.push(f[r]);
  }
  return tirage;
}
