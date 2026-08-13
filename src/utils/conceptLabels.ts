// conceptLabels.ts
//
// #52 / #55 — Source unique des libellés affichables de concepts.
//
// Un identifiant technique latin (« immunity_memory », « unit:5 ») ne doit
// JAMAIS atteindre l'interface : il apparaissait tel quel au milieu d'une
// phrase arabe RTL, à la fois dans la carte « نقاط ضعفك » du Coach (#52) et
// dans le gros titre de la mission du jour de l'onglet مساري (#55).
//
// Ces deux surfaces dupliquaient la décision ; elles la partagent désormais,
// afin qu'un concept ajouté d'un côté ne réapparaisse pas en latin de l'autre.

import { INITIAL_UNITS } from '../unitCatalog';
import { CONCEPT_ROUTES } from '../data/conceptRoutes';

export const CONCEPT_LABELS_AR: Record<string, string> = {
  enzymes: 'الإنزيمات',
  expression_genique: 'التعبير المورثي',
  adn_proteine: 'علاقة ADN-بروتين',
  transcription: 'الاستنساخ',
  traduction: 'الترجمة',
  photosynthese: 'البناء الضوئي',
  synapse: 'المشبك العصبي',
  subduction: 'الانغمار',
  protein_structure_function: 'بنية ووظيفة البروتين',
  immunity_self_nonself: 'الذات واللاذات',
  immunity_humoral_response: 'الاستجابة المناعية الخلطية',
  immunity_cellular_response: 'الاستجابة المناعية الخلوية',
  immunity_memory: 'الذاكرة المناعية',
  seismic_waves: 'الأمواج الزلزالية',
  lecon_transcription: 'الاستنساخ',
  lecon_traduction: 'الترجمة',
};

/** Unité portée par un conceptId : `unit:N` de synthèse, sinon la route nommée. */
export function resolveConceptUnitId(conceptId: string, fallbackUnitId?: number): number | undefined {
  const synthetic = /^unit:(\d+)$/.exec(conceptId);
  if (synthetic) return Number(synthetic[1]);
  const routed = CONCEPT_ROUTES[conceptId]?.unitId;
  if (routed != null) return routed;
  return fallbackUnitId;
}

/**
 * Libellé arabe affichable. Jamais l'identifiant brut : à défaut d'entrée
 * nommée, le concept est désigné par le titre officiel de son unité.
 */
export function buildConceptLabel(conceptId: string, fallbackUnitId?: number): string {
  const known = CONCEPT_LABELS_AR[conceptId];
  if (known) return known;

  const unitId = resolveConceptUnitId(conceptId, fallbackUnitId);
  const unit = unitId != null ? INITIAL_UNITS.find((u) => u.id === unitId) : undefined;
  if (unit) return unit.title;

  // Dernier recours : jamais l'id brut.
  return 'مفهوم قيد المراجعة';
}
