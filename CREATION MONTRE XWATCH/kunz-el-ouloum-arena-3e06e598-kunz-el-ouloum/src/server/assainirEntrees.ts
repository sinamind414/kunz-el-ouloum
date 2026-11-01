// ============================================================
// assainirEntrees.ts — LE SERVEUR CESSE D'ACCEPTER CE QUE L'APPAREIL DÉCLARE.
//
// CONSTAT (14/10/2026, vérifié dans le code). La route `/api/student/sync`
// transmettait au stockage les productions telles quelles :
//
//     icm:        typeof entry.icm === 'number' ? entry.icm : null   ← aucune borne
//     created_at: typeof entry.createdAt === 'string' ? ... : ''     ← date de l'appareil
//     stage:      typeof entry.stage === 'number' ? ... : null       ← aucune borne
//
// Conséquences réelles, pas théoriques :
//   · une production annoncée à `icm: 100` sur une échelle de 0 à 100 — ou à
//     9999 — entre dans la moyenne du professeur ;
//   · un `createdAt` dans six mois rend l'élève « actif dans les 7 jours »
//     pendant six mois, ce qui fausse aussi les indicateurs de pilotage
//     (`actifs7j`, `retardPremiereTrace`) qui reposent sur ces dates ;
//   · un lot de 300 productions n'est limité qu'en SILENCE (`.slice(0, 100)`) :
//     l'élève voit un succès, le professeur ne voit pas 200 lignes.
//
// Ce module applique la règle inverse : **le serveur définit le barème et
// l'horloge**. Il ne demande pas à l'appareil s'il a bien travaillé, il vérifie
// que ce qu'il raconte est possible.
//
// CE QU'IL NE FAIT PAS, et il faut le dire clairement : il ne vérifie PAS que
// la copie est bonne. Un élève peut toujours envoyer une production médiocre en
// annonçant 100/100 tant que la note est calculée sur son téléphone. Interdire
// cela demande que le barème et le corrigé vivent côté serveur (chantier A4),
// qui est un travail d'une autre ampleur : le moteur de correction est aujourd'hui
// dans le paquet livré à l'élève. Ce module ferme la porte à l'ABSURDE, pas à la
// triche fine — et le document le dit plutôt que de laisser croire le contraire.
//
// Module PUR (aucun accès base, aucun DOM) : testable, et utilisable par les
// deux stockages (SQLite, PostgreSQL).
// ============================================================

import type { ActivityEntry, ProductionEntry } from '../../server/store';

/** Échelle de l'ICM : un pourcentage de critères méthodologiques respectés. */
export const ICM_MIN = 0;
export const ICM_MAX = 100;

/** Étapes du moteur méthodologique : `StepId = 1 | 2 | 3 | 4`. */
export const STAGE_MIN = 1;
export const STAGE_MAX = 4;

/** Tolérance d'horloge : un appareil en avance de quelques minutes reste crédible. */
export const TOLERANCE_FUTUR_MS = 5 * 60 * 1000;

/** Bornes de taille — un lot d'entrées ne peut pas être un moyen de saturer la base. */
export const LOT_MAX = 100;
export const ID_MAX = 128;
export const TEXTE_MAX = 20_000;
export const TAGS_MAX = 24;
export const TAG_MAX = 40;
export const PAYLOAD_MAX = 4_000;

export const TYPES_ACTIVITE = ['quiz', 'mission', 'drill', 'production'] as const;

export interface Rapport<T> {
  /** Entrées acceptées, prêtes pour le stockage. */
  acceptees: T[];
  /** Nombre de refus par raison — remonté au client, jamais silencieux. */
  refus: Record<string, number>;
}

function compter(rapport: Record<string, number>, raison: string): void {
  rapport[raison] = (rapport[raison] ?? 0) + 1;
}

function estObjet(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Identifiant acceptable : chaîne non vide, bornée, sans caractère de contrôle. */
function idValide(v: unknown): v is string {
  // eslint-disable-next-line no-control-regex
  return typeof v === 'string' && v.length > 0 && v.length <= ID_MAX && !/[\u0000-\u001f]/.test(v);
}

function chaineBornee(v: unknown, max: number): string | null {
  return typeof v === 'string' && v.length <= max ? v : null;
}

/**
 * Horodatage retenu : celui de l'appareil s'il est CRÉDIBLE, sinon l'heure du
 * serveur.
 *
 * Une date future est impossible (on ne travaille pas demain) : elle est
 * remplacée. Une date ANCIENNE ne l'est pas : l'application fonctionne hors
 * ligne, un élève peut légitimement synchroniser une semaine de travail. La
 * remplacer effacerait sa semaine — c'est pourquoi on ne touche qu'au futur.
 */
export function horodatageCredible(
  valeur: unknown,
  maintenant: Date,
): { valeur: string; corrige: 'non' | 'future' | 'illisible' } {
  if (typeof valeur !== 'string' || valeur.length === 0 || valeur.length > 40) {
    return { valeur: maintenant.toISOString(), corrige: 'illisible' };
  }
  const t = Date.parse(valeur);
  if (Number.isNaN(t)) return { valeur: maintenant.toISOString(), corrige: 'illisible' };
  if (t > maintenant.getTime() + TOLERANCE_FUTUR_MS) {
    return { valeur: maintenant.toISOString(), corrige: 'future' };
  }
  return { valeur: valeur, corrige: 'non' };
}

/**
 * Assainit un lot de productions.
 *
 * Refus TOTAL d'une entrée dont la note ou l'étape est hors barème : une
 * production dont le score est impossible n'est pas une production dont le score
 * est approximatif — c'est une donnée qui polluerait la moyenne du professeur.
 */
export function assainirEntrees(
  entrees: unknown,
  maintenant: Date = new Date(),
): Rapport<ProductionEntry> {
  const acceptees: ProductionEntry[] = [];
  const refus: Record<string, number> = {};
  if (!Array.isArray(entrees)) return { acceptees, refus };

  if (entrees.length > LOT_MAX) compter(refus, 'lot_tronque');

  for (const brut of entrees.slice(0, LOT_MAX)) {
    if (!estObjet(brut) || !idValide(brut.id)) {
      compter(refus, 'id_invalide');
      continue;
    }
    // Note : entier dans [0, 100]. Un flottant est refusé aussi — l'ICM est un
    // pourcentage entier (methodologyScorer : Math.round).
    const icm = brut.icm;
    if (typeof icm !== 'number' || !Number.isInteger(icm) || icm < ICM_MIN || icm > ICM_MAX) {
      compter(refus, 'icm_hors_bareme');
      continue;
    }
    const stage = brut.stage;
    if (typeof stage !== 'number' || !Number.isInteger(stage) || stage < STAGE_MIN || stage > STAGE_MAX) {
      compter(refus, 'stage_hors_echelle');
      continue;
    }
    const texte = chaineBornee(brut.text, TEXTE_MAX);
    if (texte === null) {
      compter(refus, 'texte_hors_bornes');
      continue;
    }
    const verbId = chaineBornee(brut.verbId, ID_MAX);
    if (verbId === null) {
      compter(refus, 'verbe_invalide');
      continue;
    }
    const theme = chaineBornee(brut.theme, 200) ?? '';

    // Étiquettes d'erreur : on TRONQUE plutôt que de refuser — leur excès ne
    // fausse aucun score, il alourdit seulement le stockage.
    const tagsBruts = Array.isArray(brut.errorTags) ? brut.errorTags : [];
    if (tagsBruts.length > TAGS_MAX) compter(refus, 'tags_tronques');
    const errorTags = tagsBruts
      .slice(0, TAGS_MAX)
      .filter((t): t is string => typeof t === 'string' && t.length > 0 && t.length <= TAG_MAX);

    const date = horodatageCredible(brut.createdAt, maintenant);
    if (date.corrige === 'future') compter(refus, 'date_future_corrigee');
    if (date.corrige === 'illisible') compter(refus, 'date_illisible_corrigee');

    const criteres = Array.isArray(brut.criteriaSummary)
      ? (brut.criteriaSummary as ProductionEntry['criteriaSummary'])
          .filter(
            (c) =>
              estObjet(c) &&
              typeof (c as { label?: unknown }).label === 'string' &&
              typeof (c as { passed?: unknown }).passed === 'boolean',
          )
          .slice(0, 40)
      : [];

    const durationSec =
      typeof brut.durationSec === 'number' && Number.isFinite(brut.durationSec) && brut.durationSec >= 0 && brut.durationSec <= 86_400
        ? Math.round(brut.durationSec)
        : undefined;

    acceptees.push({
      id: brut.id,
      studentId: typeof brut.studentId === 'string' ? brut.studentId : '',
      verbId,
      theme,
      stage: stage as ProductionEntry['stage'],
      text: texte,
      icm,
      criteriaSummary: criteres,
      errorTags,
      ...(durationSec !== undefined ? { durationSec } : {}),
      createdAt: date.valeur,
    });
  }

  return { acceptees, refus };
}

/**
 * Assainit un lot d'événements d'activité.
 *
 * Enjeu principal : la DATE. Les indicateurs de pilotage (`actifs7j`,
 * `retardPremiereTrace`) sont calculés à partir d'elles — une date future
 * rendrait un élève « actif » artificiellement, et fausserait le suivi que le
 * professeur lit.
 */
export function assainirActivites(
  activites: unknown,
  maintenant: Date = new Date(),
): Rapport<ActivityEntry> {
  const acceptees: ActivityEntry[] = [];
  const refus: Record<string, number> = {};
  if (!Array.isArray(activites)) return { acceptees, refus };

  if (activites.length > LOT_MAX) compter(refus, 'lot_tronque');

  for (const brut of activites.slice(0, LOT_MAX)) {
    if (!estObjet(brut) || !idValide(brut.id)) {
      compter(refus, 'id_invalide');
      continue;
    }
    if (typeof brut.type !== 'string' || !(TYPES_ACTIVITE as readonly string[]).includes(brut.type)) {
      compter(refus, 'type_inconnu');
      continue;
    }
    if (!estObjet(brut.payload)) {
      compter(refus, 'payload_invalide');
      continue;
    }
    // Taille : sérialiser est le seul moyen fiable de mesurer ce qu'on stocke.
    let serialise: string;
    try {
      serialise = JSON.stringify(brut.payload);
    } catch {
      compter(refus, 'payload_non_serialisable');
      continue;
    }
    if (serialise.length > PAYLOAD_MAX) {
      compter(refus, 'payload_trop_volumineux');
      continue;
    }

    const date = horodatageCredible(brut.createdAt, maintenant);
    if (date.corrige === 'future') compter(refus, 'date_future_corrigee');
    if (date.corrige === 'illisible') compter(refus, 'date_illisible_corrigee');

    acceptees.push({
      id: brut.id,
      studentId: typeof brut.studentId === 'string' ? brut.studentId : '',
      type: brut.type as ActivityEntry['type'],
      payload: brut.payload,
      createdAt: date.valeur,
    });
  }

  return { acceptees, refus };
}

/** Fusionne les raisons de refus de plusieurs rapports (productions + activités). */
export function fusionnerRefus(...rapports: Array<Record<string, number>>): Record<string, number> {
  const total: Record<string, number> = {};
  for (const r of rapports) {
    for (const [raison, n] of Object.entries(r)) total[raison] = (total[raison] ?? 0) + n;
  }
  return total;
}
