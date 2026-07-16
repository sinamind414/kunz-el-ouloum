// verbMapping.ts
// Mappe un verbe d'action AR → actionVerb + loiFocus + checks clés (Speckit §5.6).
// Polysémie de « حدد » résolue selon le contexte du prompt.

import { normalizeAr } from './normalizeAr';

export type ActionVerb =
  | 'identify' | 'describe' | 'analyse' | 'interpret'
  | 'compare' | 'hypothesize' | 'validate' | 'synthesize'
  | 'schematize' | 'justify' | 'critique';

export interface VerbMapping {
  actionVerb: ActionVerb;
  loiFocus: 0 | 1 | 2 | 3 | 4 | 5;
  checks: string[];
}

const MAP: Record<string, VerbMapping> = {
  حدد: { actionVerb: 'describe', loiFocus: 0, checks: ['VALUE_UNIT', 'IDENTIFY'] },
  'حدد المشكل': { actionVerb: 'identify', loiFocus: 0, checks: ['IDENTIFY'] },
  'حدد العلاقة': { actionVerb: 'analyse', loiFocus: 2, checks: ['KULLAMA', 'VALUE_UNIT'] },
  'حدد الآلية': { actionVerb: 'interpret', loiFocus: 3, checks: ['CAUSAL', 'LEVELS'] },

  وصف: { actionVerb: 'describe', loiFocus: 1, checks: ['VALUE_UNIT'] },
  'اذكر': { actionVerb: 'describe', loiFocus: 1, checks: ['VALUE_UNIT'] },
  صف: { actionVerb: 'describe', loiFocus: 1, checks: ['VALUE_UNIT'] },

  حلل: { actionVerb: 'analyse', loiFocus: 2, checks: ['FOUR_STEPS', 'KULLAMA', 'VALUE_UNIT'] },
  تحليل: { actionVerb: 'analyse', loiFocus: 2, checks: ['FOUR_STEPS', 'KULLAMA', 'VALUE_UNIT'] },
  'تحليل مقارن': { actionVerb: 'compare', loiFocus: 2, checks: ['RELATION_MARKER', 'KULLAMA'] },
  قارن: { actionVerb: 'compare', loiFocus: 2, checks: ['RELATION_MARKER', 'KULLAMA'] },

  فسر: { actionVerb: 'interpret', loiFocus: 3, checks: ['CAUSAL', 'LEVELS', 'PPM', 'ACH'] },
  اشرح: { actionVerb: 'interpret', loiFocus: 3, checks: ['CAUSAL', 'LEVELS', 'PPM', 'ACH'] },
  وضح: { actionVerb: 'interpret', loiFocus: 3, checks: ['CAUSAL', 'LEVELS', 'PPM', 'ACH'] },
  علل: { actionVerb: 'justify', loiFocus: 3, checks: ['CAUSAL', 'LEVELS'] },

  'اقترح فرضية': { actionVerb: 'hypothesize', loiFocus: 4, checks: ['NAFTARID', 'NO_RUBBAMA', 'TARGET'] },
  'صغ فرضية': { actionVerb: 'hypothesize', loiFocus: 4, checks: ['NAFTARID', 'NO_RUBBAMA', 'TARGET'] },

  صادق: { actionVerb: 'validate', loiFocus: 5, checks: ['BLOCKS', 'H2_SOFT'] },
  ناقش: { actionVerb: 'validate', loiFocus: 5, checks: ['BLOCKS', 'H2_SOFT'] },
  أثبت: { actionVerb: 'validate', loiFocus: 5, checks: ['BLOCKS', 'H2_SOFT'] },

  'اكتب نصا علميا': { actionVerb: 'synthesize', loiFocus: 5, checks: ['TEXT_STRUCTURE'] },
  'أنجز مخططا': { actionVerb: 'schematize', loiFocus: 5, checks: ['SCHEMA_TITLE'] },
  'أنجز رسما': { actionVerb: 'schematize', loiFocus: 5, checks: ['SCHEMA_TITLE'] },
  نقد: { actionVerb: 'critique', loiFocus: 5, checks: ['BLOCKS'] },
};

/** Devine l'actionVerb à partir d'un verbe/prompt AR. */
export function mapVerb(input: string): VerbMapping | null {
  const norm = normalizeAr(input);
  if (!norm) return null;
  // Correspondances exactes (prompt complet) d'abord
  for (const [key, val] of Object.entries(MAP)) {
    if (normalizeAr(key) === norm) return val;
  }
  // Puis mots-clés contenus
  for (const [key, val] of Object.entries(MAP)) {
    if (norm.includes(normalizeAr(key))) return val;
  }
  return null;
}
