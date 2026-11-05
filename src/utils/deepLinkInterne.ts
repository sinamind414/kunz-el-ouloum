// deepLinkInterne.ts — paramètres de lien profond (étape 3, 2026-11-05).
//
// Jusqu'ici une URL ne portait que la RUBRIQUE (`#/apprentissage/cours`) : les
// raccourcis internes de l'app (ouvrir une leçon précise, un QCM d'unité, un
// exercice BAC) vivaient uniquement dans l'état React et étaient perdus dès
// qu'on arrivait de l'extérieur (notification, lien depuis l'accueil, favori).
//
// Ce module ne fait que LIRE et VALIDER une query string. Il n'écrit pas d'URL
// et ne crée AUCUN contenu : chaque valeur est confrontée à une source réelle
// du dépôt avant d'être transmise aux vues.
//   · `lecon` : clé cherchée dans PARCOURS_FLAT (83 items, 72 leçons). Une clé
//     inconnue est IGNORÉE, jamais transmise à LessonsView.
//   · `qcm`   : unité cherchée parmi les unités réelles du parcours.
//   · `idee`  : identifiant d'idée BAC validé par `estIdeeBacValide`, lui-même
//     recoupé avec les 65 `BAC_IDEAS` par le verrou (test uniquement — la
//     banque reste hors du bundle d'entrée). Le trou 2021 S2 E1 est exclu.
//   · `examen` : 'qcm' | 'bac', les deux seuls modes de LessonsView.
//
// Priorité (une seule cible d'écran par URL) : lecon > qcm > examen. `idee`
// est indépendant : il ouvre l'écran `bacideas` (Entraînement).

import { PARCOURS_FLAT } from '../lib/parcours/parcoursPath';

export interface LeconCible {
  key: string;
  kind: 'html' | 'active';
  unitId: number;
}

export interface DeepLinkInterne {
  lecon?: LeconCible;
  qcm?: number;
  examen?: 'qcm' | 'bac';
  idee?: string;
}

/** Unités réelles du parcours (aucun « 12 » inventé). */
export const UNITES_REELLES: readonly number[] = [
  ...new Set(PARCOURS_FLAT.map((i) => i.unitId)),
].sort((a, b) => a - b);

/**
 * Forme des 65 idées officielles 2016→2026, sans importer la banque (lourde)
 * dans le bundle d'entrée. Le verrou deepLinkInterne.lock.test.ts prouve que
 * cette expression accepte exactement les 65 ids réels et refuse le trou
 * déclaré `bac2021_s2_e1` (INCOMPLETE_SUJETS).
 */
export function estIdeeBacValide(id: string): boolean {
  if (!/^bac20\d{2}_s[12]_e[1-3]$/.test(id)) return false;
  const annee = Number(id.slice(3, 7));
  if (annee < 2016 || annee > 2026) return false;
  if (id === 'bac2021_s2_e1') return false; // énoncé illisible, non indexé
  return true;
}

/** `?lecon=…&qcm=…` — sans le « ? ». Retourne null si rien n'est valide. */
export function lireDeepLinkInterne(query: string): DeepLinkInterne | null {
  if (!query) return null;
  const params = new URLSearchParams(query.replace(/^\?/, ''));
  const out: DeepLinkInterne = {};

  const lecon = params.get('lecon');
  if (lecon) {
    const item = PARCOURS_FLAT.find((i) => i.kind === 'lesson' && i.lessonKey === lecon);
    if (item?.lessonKey) {
      out.lecon = {
        key: item.lessonKey,
        kind: item.lessonKind ?? 'html',
        unitId: item.unitId,
      };
    }
  }

  if (!out.lecon) {
    const brut = params.get('qcm');
    if (brut && /^\d+$/.test(brut) && UNITES_REELLES.includes(Number(brut))) {
      out.qcm = Number(brut);
    }
    if (out.qcm === undefined) {
      const mode = params.get('examen');
      if (mode === 'qcm' || mode === 'bac') out.examen = mode;
    }
  }

  const idee = params.get('idee');
  if (idee && estIdeeBacValide(idee)) out.idee = idee;

  return Object.keys(out).length > 0 ? out : null;
}

/** Fabrique les paramètres ÉCRITS par les raccourcis internes de l'app.
    Mêmes noms et mêmes validations que `lireDeepLinkInterne` (aller-retour). */
export function queryPourLecon(key: string): string {
  return `lecon=${encodeURIComponent(key)}`;
}
export function queryPourQcm(unite: number): string {
  return `qcm=${unite}`;
}
export function queryPourExamen(mode: 'qcm' | 'bac'): string {
  return `examen=${mode}`;
}
export function queryPourIdee(id: string): string {
  return `idee=${encodeURIComponent(id)}`;
}

/** Query d'une URL : le hash est prioritaire (notation PWA), sinon `?` du chemin. */
export function queryDeUrl(hash: string, search: string): string {
  const i = hash.indexOf('?');
  if (i >= 0) return hash.slice(i + 1);
  return search.replace(/^\?/, '');
}
