// src/data/microLecons.ts — R5 de l'audit du 7/11/2026 (2026-11-07).
//
// « Découper les leçons longues en micro-leçons de 5–10 min et ajouter une
//  synthèse « 3 phrases » normalisée en fin de chaque leçon. »
//
// ⚠️ ZÉRO CONTENU INVENTÉ : tous les textes sont soit des extraits VERBATIM
// de l'index des leçons (562 chunks générés), soit les phrases déjà ancrées
// et verrouillées de `RESUMES_LECONS` (resumes.lock.test.ts).
//
// ⚠️ ARCHITECTURE SOURCE UNIQUE (verrou tutorLeconsJson.lock.test.ts) :
// l'index des leçons ne doit JAMAIS voyager en JavaScript — il est émis en
// `dist/tutor/lesson-index.json` et récupéré par fetch. Ce module est donc
// PUR : `import type` uniquement (effacé à la compilation) et les chunks
// sont passés en argument par `MicroLeconsPanel` via `lessonIndexRuntime`.
//
// [INTERPRÉTATION] Le découpage et le temps par micro-leçon sont des RÈGLES
// DE PRÉSENTATION, pas des données officielles : la seule durée utilisée est
// celle que le cours déclare lui-même (« المدة التقديرية للتعلم الذاتي »).
// Quand le cours n'en déclare pas, `minutes` reste `null` : « Non vérifiable »,
// jamais un chiffre fabriqué.

import type { LessonIndexChunk } from './lessonIndex';
import { RESUMES_LECONS, resumePourActif } from './resumesLecons';

/** Cible chiffrée de l'audit R5 : aucune micro-leçon > 10 min. */
export const DUREE_MAX_MICRO_MIN = 10;
/** [INTERPRÉTATION] Regroupement structurel : ≤ 3 chunks consécutifs (≤ 520 car. chacun). */
export const CHUNKS_PAR_MICRO = 3;

/** Ancrage EXACT : les « بعد 3/20/120 دقيقة » sont des temps d'EXPÉRIENCE,
 *  pas des durées d'apprentissage — ils ne doivent jamais être comptés. */
const RE_DUREE_DECLAREE = /المدة التقديرية للتعلم الذاتي\s*[:：]?\s*(\d{1,3})\s*دقيقة/g;

export const AVERTISSEMENT_MICRO_AR =
  '[INTERPRÉTATION] التقسيم والتقدير الزمني اجتهاد تعليمي، ليس معياراً رسمياً. ' +
  'حين لا يُصرّح الدرس بمدته، تُعرض « المدة غير مصرّح بها » — « Non vérifiable ». ' +
  'النصوص مقتبسة حرفياً من الدروس، دون أي إضافة.';

export interface MicroLecon {
  id: string;
  lessonKey: string;
  lessonTitle: string;
  kind: 'html' | 'active';
  unitId: number;
  index: number;
  total: number;
  /** `null` = aucune durée déclarée dans le cours (« Non vérifiable »). */
  minutes: number | null;
  chunkIds: string[];
  /** Titres VERBATIM des chunks (heading de la carte). */
  titres: string[];
  /** Textes VERBATIM des chunks. */
  textes: string[];
  caracteres: number;
}

export interface SyntheseTroisPhrases {
  phrases: string[];
  /** 'resume-ancre' = RESUMES_LECONS (ancré livre officiel) ;
   *  'extrait-cours' = 3 segments verbatim d'un chunk de synthèse ;
   *  'absente' = moins de 3 segments exploitables, rien n'est fabriqué. */
  source: 'resume-ancre' | 'extrait-cours' | 'absente';
}

export interface LeconDecoupee {
  cle: string;
  lessonKey: string;
  lessonTitle: string;
  kind: 'html' | 'active';
  unitId: number;
  nbChunks: number;
  caracteres: number;
  /** Max des durées déclarées dans les chunks d'introduction, sinon `null`. */
  dureeDeclareeMinutes: number | null;
  microLecons: MicroLecon[];
  synthese: SyntheseTroisPhrases;
}

export interface StatsMicroLecons {
  lecons: number;
  chunks: number;
  microLecons: number;
  leconsAvecDureeDeclaree: number;
  leconsSansDureeDeclaree: number;
  syntheseAncre: number;
  syntheseExtrait: number;
  syntheseAbsente: number;
  dureeMaxMicro: number;
}

function grouperParLecon(chunks: readonly LessonIndexChunk[]): Map<string, LessonIndexChunk[]> {
  const groupes = new Map<string, LessonIndexChunk[]>();
  for (const chunk of chunks) {
    const cle = `${chunk.kind}:${chunk.lessonKey}`;
    const liste = groupes.get(cle);
    if (liste) liste.push(chunk);
    else groupes.set(cle, [chunk]);
  }
  return groupes;
}

function dureeDeclaree(chunks: readonly LessonIndexChunk[]): number | null {
  const texte = chunks.map((c) => c.text).join(' ');
  RE_DUREE_DECLAREE.lastIndex = 0;
  const valeurs = [...texte.matchAll(RE_DUREE_DECLAREE)].map((m) => Number(m[1]));
  return valeurs.length ? Math.max(...valeurs) : null;
}

function phrasesDepuisCours(chunks: readonly LessonIndexChunk[]): string[] {
  // Priorité aux chunks qui portent déjà une synthèse dans le cours.
  const candidats = chunks.filter((c) =>
    /خلاصة|حصيلة|الحقيقة العلمية|ملخص|التقويم/.test(`${c.title} ${c.text}`),
  );
  const base = candidats.length ? candidats : chunks;
  const segments: string[] = [];
  for (const chunk of base) {
    for (const brut of chunk.text.split(/[.!?؟؛;\n•]+/u)) {
      // On retire uniquement les PRÉFIXES (émojis, numérotation, étiquette
      // « خلاصة الدرس », « 🎯 ») : le reste reste une sous-chaîne VERBATIM.
      const sansIcones = brut.replace(/^\P{L}+/u, '').trim();
      const phrase = sansIcones
        .replace(/^خلاصة الدرس\s*/u, '')
        .replace(/^\P{L}+/u, '')
        .trim();
      if (phrase.length >= 25 && phrase.length <= 400 && !segments.includes(phrase)) {
        segments.push(phrase);
      }
      if (segments.length >= 3) return segments.slice(0, 3);
    }
  }
  return segments.slice(0, 3);
}

function synthesePour(
  lessonKey: string,
  chunks: readonly LessonIndexChunk[],
): SyntheseTroisPhrases {
  const resume = RESUMES_LECONS[lessonKey] ?? resumePourActif(lessonKey);
  if (resume && resume.objectif && resume.points.length >= 2) {
    return {
      phrases: [resume.objectif, resume.points[0], resume.points[1]],
      source: 'resume-ancre',
    };
  }
  const extraites = phrasesDepuisCours(chunks);
  return {
    phrases: extraites,
    source: extraites.length === 3 ? 'extrait-cours' : 'absente',
  };
}

function decouper(cle: string, chunks: LessonIndexChunk[]): LeconDecoupee {
  const premier = chunks[0];
  const duree = dureeDeclaree(chunks);
  const caracteres = chunks.reduce((s, c) => s + c.text.length, 0);
  const parChunks = Math.max(1, Math.ceil(chunks.length / CHUNKS_PAR_MICRO));
  const parDuree = duree === null ? 1 : Math.max(1, Math.ceil(duree / DUREE_MAX_MICRO_MIN));
  const total = Math.max(parChunks, parDuree);

  // Répartition contiguë : les `reste` premiers groupes prennent un chunk de plus.
  const parGroupe = Math.floor(chunks.length / total);
  const reste = chunks.length % total;
  const microLecons: MicroLecon[] = [];
  let curseur = 0;
  for (let i = 0; i < total; i += 1) {
    const taille = parGroupe + (i < reste ? 1 : 0);
    const tranche = chunks.slice(curseur, curseur + taille);
    curseur += taille;
    microLecons.push({
      id: `${cle}#m${i + 1}`,
      lessonKey: premier.lessonKey,
      lessonTitle: premier.lessonTitle,
      kind: premier.kind,
      unitId: premier.unitId,
      index: i + 1,
      total,
      // nbMicro >= ceil(duree/10) garantit minutes <= 10.
      minutes: duree === null ? null : Math.ceil(duree / total),
      chunkIds: tranche.map((c) => c.id),
      titres: tranche.map((c) => c.title),
      textes: tranche.map((c) => c.text),
      caracteres: tranche.reduce((s, c) => s + c.text.length, 0),
    });
  }

  return {
    cle,
    lessonKey: premier.lessonKey,
    lessonTitle: premier.lessonTitle,
    kind: premier.kind,
    unitId: premier.unitId,
    nbChunks: chunks.length,
    caracteres,
    dureeDeclareeMinutes: duree,
    microLecons,
    synthese: synthesePour(premier.lessonKey, chunks),
  };
}

/** Pur : les chunks viennent du runtime (JSON), jamais d'un import statique. */
export function construireLeconsDecoupees(
  chunks: readonly LessonIndexChunk[],
): LeconDecoupee[] {
  return [...grouperParLecon(chunks).entries()].map(([cle, groupe]) => decouper(cle, groupe));
}

export function statsMicroLecons(lecons: readonly LeconDecoupee[]): StatsMicroLecons {
  return {
    lecons: lecons.length,
    chunks: lecons.reduce((s, l) => s + l.nbChunks, 0),
    microLecons: lecons.reduce((s, l) => s + l.microLecons.length, 0),
    leconsAvecDureeDeclaree: lecons.filter((l) => l.dureeDeclareeMinutes !== null).length,
    leconsSansDureeDeclaree: lecons.filter((l) => l.dureeDeclareeMinutes === null).length,
    syntheseAncre: lecons.filter((l) => l.synthese.source === 'resume-ancre').length,
    syntheseExtrait: lecons.filter((l) => l.synthese.source === 'extrait-cours').length,
    syntheseAbsente: lecons.filter((l) => l.synthese.source === 'absente').length,
    dureeMaxMicro: Math.max(
      0,
      ...lecons.flatMap((l) => l.microLecons.map((m) => m.minutes ?? 0)),
    ),
  };
}

export function microLeconsPour(
  lecons: readonly LeconDecoupee[],
  lessonKey: string,
  kind?: 'html' | 'active',
): LeconDecoupee | null {
  return lecons.find((l) => l.lessonKey === lessonKey && (!kind || l.kind === kind)) ?? null;
}
