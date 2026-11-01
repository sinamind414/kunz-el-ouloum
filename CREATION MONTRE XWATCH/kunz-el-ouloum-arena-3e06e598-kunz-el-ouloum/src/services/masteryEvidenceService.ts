// src/services/masteryEvidenceService.ts
// Preuves de maîtrise « transfert » (Défi BAC) — Speckit V2 §2.3/§2.4.
// Une preuve de transfert est enregistrée quand un élève applique un réflexe
// méthodologique (reflexId) à un concept hors de la leçon d'origine — c'est
// l'ÉVIDENCE de maîtrise (pas un auto-déclaré de l'élève).
//
// 100 % local et apatride : localStorage versionné, best-effort (une panne
// de stockage ne casse jamais le parcours). La remontée Supabase (télémétrie
// optionnelle) se branchera ici si des credentials sont fournies.

const TRACE_KEY = 'kunz_v2:transfer_evidence';
const MAX_TRACES = 300;

export interface TransferEvidence {
  at: number;
  lessonId: string;
  conceptId: string;
  reflexId: string;
  score: number;
  ruleIds: string[];
}

export interface TransferEvidenceInput {
  lessonId: string;
  conceptId: string;
  reflexId: string;
  score: number;
  ruleIds: string[];
}

function readAll(): TransferEvidence[] {
  try {
    const raw = localStorage.getItem(TRACE_KEY);
    return raw ? (JSON.parse(raw) as TransferEvidence[]) : [];
  } catch {
    return [];
  }
}

/** Enregistre une preuve de transfert (une ligne par tentative, horodatée). */
export function recordLessonTransferEvidence(input: TransferEvidenceInput): void {
  try {
    const all = readAll();
    all.push({ at: Date.now(), ...input });
    localStorage.setItem(TRACE_KEY, JSON.stringify(all.slice(-MAX_TRACES)));
  } catch {
    // localStorage indisponible : télémétrie silencieusement désactivée.
  }
}

export function getTransferEvidence(): TransferEvidence[] {
  return readAll();
}
