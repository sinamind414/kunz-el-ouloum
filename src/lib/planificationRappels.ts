// src/lib/planificationRappels.ts — LE PONT H1 : une erreur détectée → la micro-reprise déclarée.
//
// ══════════════════════════════════════════════════════════════════════════
// CE QUI MANQUAIT (mesuré le 16/10/2026 — audit externe « 8 axes », H1)
// ══════════════════════════════════════════════════════════════════════════
// Trois organes existaient, séparés, et aucun ne parlait aux deux autres :
//
//   · `MICRO_REMEDIATIONS` (31 entrées) déclarait par entrée une intention
//     (`nextAction: 'schedule_recall'` : après CETTE erreur, la notion doit
//     REVENIR) — et cette intention n'était lue par personne ;
//   · `planifierRappel()` était écrite pour honorer précisément cette
//     intention (« l'unique usage est la micro-reprise qui déclare
//     `nextAction: 'schedule_recall'` ») — et n'avait AUCUN appelant ;
//   · le corpus entier n'était affiché par aucune vue.
//
// Le compteur d'erreurs réel, lui, tourne depuis le 14/10/2026 :
// `enregistrerErreurs()` est appelé par l'atelier méthodologique et par la
// déclaration de cause du QCM — mais avec les codes de `ERROR_TAXONOMY`,
// alors que les `triggerCodes` du corpus appartiennent à une nomenclature
// (`err_*`, `MISSING_*`, `CONFUSION_*`) qu'aucun producteur n'émet. Deux
// espaces de codes, zéro intersection : c'est cela, l'inertie mesurée.
//
// Ce module réunit les trois organes :
//
//   codes détectés ──► remediationPour(code)          (le résolveur unique)
//                       │
//                       ├─ nextAction = 'schedule_recall'
//                       │    └─► planifierRappel(conceptId)  (SM-2, rappelAdaptatif)
//                       └─ sinon ──► la carte est AFFICHÉE (CarteMicroRemediation)
//
// Le résolveur porte le nom `remediationPour` — exactement celui que l'audit
// a trouvé orphelin. Il n'existait pas ; il existe désormais, appelé par deux
// flux réels, et un test échoue si l'un des deux appels est neutralisé.
//
// MODULE LOCAL uniquement (localStorage via rappelAdaptatif) : aucune requête,
// aucun identifiant — la promesse « rien ne quitte le téléphone » tient.

import {
  MICRO_REMEDIATIONS,
  getMicroRemediationByCode,
  type MicroRemediation,
} from '../data/microRemediations';
import { planifierRappel, chargeBanque } from './rappelAdaptatif';
import { estConceptRappel } from './rappelConcepts';

/**
 * La micro-reprise pour un code d'erreur détecté — le résolveur unique.
 *
 * DEUX portes, dans cet ordre :
 *
 *   · `triggerCodes` — la nomenclature d'origine du corpus (V3 §3.3 : « codes
 *     d'erreur du ValidationEngine / des leçons actives ») ;
 *   · `taxonomyCodes` — les codes RÉELLEMENT produits aujourd'hui par le
 *     correcteur (`ERROR_TAXONOMY`). Ce lien est posé entrée par entrée, UNIQUEMENT
 *     quand le texte de la taxonomie et celui de la micro-reprise décrivent LA
 *     MÊME faute (commentaire de chaque entrée reliée) — jamais par ressemblance
 *     approximative. Relier à tort inventerait un diagnostic : pire que l'absence.
 */
export function remediationPour(code: string): MicroRemediation | undefined {
  if (typeof code !== 'string' || code.length === 0) return undefined;
  const parTrigger = getMicroRemediationByCode(code);
  if (parTrigger) return parTrigger;
  return Object.values(MICRO_REMEDIATIONS).find((r) => r.taxonomyCodes?.includes(code));
}

/**
 * L'intention `schedule_recall` devient un rappel SM-2 réellement programmé.
 *
 * Appelée à CHAQUE détection d'erreur (les mêmes sites que `enregistrerErreurs`).
 * Pour chaque code : la micro-reprise correspondante est résolue, et si — et
 * seulement si — elle déclare `schedule_recall`, le concept est remis à l'ordre
 * du jour de l'ordonnanceur.
 *
 * L'IDEMPOTENCE N'EST PAS UN DÉTAIL : `planifierRappel` n'écrase JAMAIS un
 * espacement en cours (« une erreur survenue aujourd'hui ne doit pas annuler un
 * espacement déjà construit »). Ce pont en hérite sans rien ajouter ; un élève
 * qui refait la même faute trois fois reçoit UN rappel, pas un rappel réinitialisé
 * trois fois.
 *
 * Renvoie les identifiants de concepts PROGRAMMÉS par cet appel (dédupliqués) —
 * c'est ce que l'appelant et les tests utilisent pour prouver l'effet.
 */
export function planifierRappelsPourErreurs(
  codes: readonly string[],
  now: number = Date.now(),
): string[] {
  const programmes: string[] = [];
  for (const code of codes) {
    const remediation = remediationPour(code);
    if (!remediation) continue;
    if (remediation.nextAction !== 'schedule_recall') continue;
    planifierRappel(remediation.conceptId, now);
    if (!programmes.includes(remediation.conceptId)) {
      programmes.push(remediation.conceptId);
    }
  }
  return programmes;
}

/**
 * P1-2 (28/10/2026) — LE SECOND POINT D'ENTRÉE DE LA BANQUE : l'agenda
 * d'ouverture (branchement (c) validé par le propriétaire).
 *
 * Contrairement au pont erreur→concept ci-dessus (16 concepts manuels clavés
 * par nomenclature d'erreurs), celui-ci programme le rappel de la leçon gold
 * elle-même (identifiant = lessonId de LESSON_GOLD_SUMMARIES, couvert par le
 * corpus AUTO de `spacedRecallPromptsAuto.ts` — 63 concepts générés).
 *
 * Pédagogie : d'abord étudié, ensuite rappelé. Ouvrir le résumé d'or d'une
 * leçon rend son concept éligible à la répétition espacée SM-2.
 *
 * SÛRETÉS :
 *   · le concept doit appartenir au corpus (manuel OU auto) — une leçon sans
 *     prompts n'entre jamais dans la banque (pas d'entrée morte) ;
 *   · l'idempotence de `planifierRappel` est héritée telle quelle : un
 *     espacement déjà construit n'est JAMAIS écrasé (relire une leçon déjà
 *     planifiée ne réinitialise rien) ;
 *   · MODULE LOCAL uniquement (localStorage) — la promesse « rien ne quitte le
 *     téléphone » tient.
 *
 * Renvoie le concept programmé, ou null (leçon hors corpus / déjà planifiée
 * avec un espacement en cours).
 */
export function planifierRappelPourLecon(
  lessonId: string,
  now: number = Date.now(),
): string | null {
  if (typeof lessonId !== 'string' || lessonId.length === 0) return null;
  if (!estConceptRappel(lessonId)) return null;
  const dejaEnBanque = chargeBanque()[lessonId];
  planifierRappel(lessonId, now);
  return dejaEnBanque ? null : lessonId;
}
