// phase2.ts — Verdict de la Phase 2 (docs/AUDIT_APPROCHE_APP.md §3.3, ordre §6 ligne 4)
//
// En Phase 2 (stades 2-3 du simulateur : complétion + production guidée), le verdict
// AUTOMATIQUE ne couvre que la FORME de la réponse :
//   porte 1 (source) + porte 2 (interrupteur) + structure (scoreur, ICM ≥ seuil,
//   sans erreur typique du verbe).
// Il ne valide PAS le fond scientifique — celui-ci est garanti en Phase 3 (correction
// par l'enseignant). D'où le titre imposé : « forme validée », jamais « correct ».
//
// Pas de second moteur de checks : le scoreur existant (methodologyScorer +
// ValidationEngine, 8 tags, 138 invariants) est la seule source de binaires.

export const PHASE2_FORM_THRESHOLD = 60;

export interface Phase2GateInput {
  /** 🚪 البوابة ١ — الوجود : l'élève a-t-il bien classé قفل/لا قفل ? null = non évaluée. */
  existenceGateOk: boolean | null;
  /** 📥 البوابة ٢ — المصدر : وثيقة/مختلط bien classée ? null = non évaluée. */
  sourceGateOk: boolean | null;
  /** ⚙️ البوابة ٣ — الحركة : 📷/🎬/🔨 bien classée ? null = non évaluée. */
  movementGateOk: boolean | null;
  /** Scoreur — ICM 0-100. */
  icm: number;
  /** Scoreur — l'erreur typique du verbe a-t-elle été commise ? */
  typicalErrorViolated: boolean;
}

export interface Phase2GateResult {
  /** Update 2026-09-06 (MARQUE §12) : 4 pastilles — 3 portes de classification + la forme. */
  id: 'existence' | 'source' | 'movement' | 'forme';
  labelAr: string;
  /** null = non évaluée (la porte n'est pas exigée dans ce flux). */
  passed: boolean | null;
}

export interface Phase2Verdict {
  /** « Forme validée » — la structure seulement ; le fond est garanti en Phase 3. */
  formeValidee: boolean;
  gates: Phase2GateResult[];
  messageAr: string;
}

// ── Renvoi ciblé (audit §3.7) : micro-séquence 2a sur la SOUS-ÉTAPE en défaut,
//    pas la re-Phase-2 intégrale. Pur + testable.
import type { StepLine } from './methodologyScorer';

export interface RemediationTarget {
  step: StepLine['step'];
  tags: string[];
  remedyAr?: string;
}

/** Les étapes applicables et en échec du rapport (ordre du parcours). */
export function remediationTargets(stepReport: StepLine[]): RemediationTarget[] {
  return stepReport
    .filter(l => l.applicable && !l.passed)
    .map(l => ({ step: l.step, tags: l.errorTags, remedyAr: l.remedyAr }));
}

export function evaluatePhase2(inp: Phase2GateInput): Phase2Verdict {
  // Update 2026-09-06 (MARQUE §12) : TROIS portes de classification + la forme.
  const gates: Phase2GateResult[] = [
    { id: 'existence', labelAr: 'البوابة ١ — الوجود (قفل؟)', passed: inp.existenceGateOk },
    { id: 'source', labelAr: 'البوابة ٢ — المصدر (وثيقة/مختلط)', passed: inp.sourceGateOk },
    { id: 'movement', labelAr: 'البوابة ٣ — الحركة (📷/🎬/🔨)', passed: inp.movementGateOk },
    {
      id: 'forme',
      labelAr: `البنية (ICM ≥ ${PHASE2_FORM_THRESHOLD} بلا الخطأ النموذجي)`,
      passed: !inp.typicalErrorViolated && inp.icm >= PHASE2_FORM_THRESHOLD,
    },
  ];
  const failed = gates.filter(g => g.passed === false);
  const formeValidee = failed.length === 0;
  const messageAr = formeValidee
    ? `✅ شكل الإجابة مُتحقَّق منه (ICM ${inp.icm}%). هذا يضمن البنية المنهجية فقط — ضمان المضمون العلمي في المرحلة 3 مع الأستاذ.`
    : `❌ الشكل لم يكتمل بعد: ${failed.map(g => g.labelAr).join(' · ')}. المضمون خارج هذا الحكم (المرحلة 3).`;
  return { formeValidee, gates, messageAr };
}
