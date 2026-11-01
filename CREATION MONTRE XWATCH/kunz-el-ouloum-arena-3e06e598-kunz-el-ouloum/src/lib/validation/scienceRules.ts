// scienceRules.ts — Vérification scientifique V2 (port TS)
//
// Charge les règles depuis data/scienceRules/*.json et vérifie une copie arabe
// normalisée contre le thème attendu.
//
// Règles :
//   - facts[]     : faits scientifiques attendus (étanté, avec variations)
//   - errors[]    : erreurs graves à détecter (pattern normalisé + label_ar + severity)
//   - contradictions : paires de faits incompatibles (si les deux présents dans la copie = erreur)
//
// Le vérificateur retourne :
//   - status : 'ok' | 'error' | 'partial'
//   - facts_present  : liste des faits trouvés dans la copie
//   - facts_missing  : liste des faits attendus absents
//   - flags  : erreurs graves / warnings détectées

import { normalizeAr } from './normalizeAr';
import respirationRules from '../../data/scienceRules/respiration.json';

export interface ScienceFactEntry {
  id: string;
  label_ar: string;
  variants: string[];         // formes normalisées attendues
  weight: number;
}

export interface ScienceErrorEntry {
  id: string;
  pattern: string;            // regex normalisé (sous-chaîne, pas fullmatch)
  label_ar: string;
  msg_ar: string;
  severity: 'grave' | 'warning';
}

export interface ScienceContradiction {
  factA: string;             // id du fait A
  factB: string;             // id du fait B
  label_ar: string;          // erreur affichée si A et B présents ensemble
}

export interface ScienceRuleSet {
  id: string;
  theme: string;
  facts: ScienceFactEntry[];
  errors: ScienceErrorEntry[];
  contradictions: ScienceContradiction[];
}

export interface ScienceResult {
  status: 'ok' | 'error' | 'partial';
  facts_present: string[];
  facts_missing: string[];
  flags: {
    code: string;
    label_ar: string;
    msg_ar: string;
    severity: 'grave' | 'warning';
  }[];
}

const RULES_REGISTRY: Record<string, ScienceRuleSet> = {
  respiration: respirationRules as ScienceRuleSet,
};

const RULES_CACHE: Record<string, ScienceRuleSet | null> = {};

export async function loadScienceRules(ruleId: string): Promise<ScienceRuleSet | null> {
  if (ruleId in RULES_CACHE) return RULES_CACHE[ruleId];
  const rule = RULES_REGISTRY[ruleId] ?? null;
  RULES_CACHE[ruleId] = rule;
  return rule;
}

/**
 * Vérifier une copie arabe normalisée contre un jeu de règles scientifiques.
 *
 * Logique :
 *   1. Pour chaque fait attendu, vérifier si une de ses variantes est présente dans la copie.
 *   2. Pour chaque error pattern, vérifier si le pattern matche la copie.
 *   3. Pour chaque contradiction, si les deux faits A et B sont présents → flag grave.
 *
 * Status :
 *   - 'error' si ≥ 1 flag de sévérité 'grave'
 *   - 'partial' si des faits sont manquants mais pas d'erreur grave
 *   - 'ok' si tous les faits présents et pas d'erreur
 */
export async function verifierScience(
  copieNormalisee: string,
  ruleId: string,
): Promise<ScienceResult> {
  const rule = await loadScienceRules(ruleId);
  if (!rule) {
    return {
      status: 'partial',
      facts_present: [],
      facts_missing: [],
      flags: [{ code: 'RULE_NOT_FOUND', label_ar: 'قاعدة غير معروفة', msg_ar: `لا توجد قاعدة علمية "${ruleId}"`, severity: 'warning' }],
    };
  }

  const norm = normalizeAr(copieNormalisee);
  const presentFacts: string[] = [];
  const missingFacts: string[] = [];

  // 1. Fait présent / absent
  for (const fact of rule.facts) {
    const found = fact.variants.some(v => norm.includes(normalizeAr(v)));
    if (found) {
      presentFacts.push(fact.id);
    } else {
      missingFacts.push(fact.id);
    }
  }

  // 2. Erreurs
  const flags: ScienceResult['flags'] = [];
  for (const err of rule.errors) {
    try {
      const re = new RegExp(err.pattern, 'i');
      if (re.test(norm)) {
        flags.push({
          code: err.id,
          label_ar: err.label_ar,
          msg_ar: err.msg_ar,
          severity: err.severity,
        });
      }
    } catch {
      // Pattern regex invalide → ignoré silencieusement (ne pas crasher le moteur)
    }
  }

  // 3. Contradictions : les deux faits présents → flag grave
  for (const c of rule.contradictions) {
    if (presentFacts.includes(c.factA) && presentFacts.includes(c.factB)) {
      flags.push({
        code: `CONTRADICTION_${c.factA}_${c.factB}`,
        label_ar: c.label_ar,
        msg_ar: c.label_ar,
        severity: 'grave',
      });
    }
  }

  const hasGrave = flags.some(f => f.severity === 'grave');
  const status: ScienceResult['status'] = hasGrave
    ? 'error'
    : missingFacts.length > 0 ? 'partial'
    : 'ok';

  return { status, facts_present: presentFacts, facts_missing: missingFacts, flags };
}

/**
 * Transforme ScienceResult en entrée compatible LetterGrid (pour l'orchestre).
 */
export function scienceResultToStatus(result: ScienceResult): 'ok' | 'error' | 'partial' {
  return result.status;
}
