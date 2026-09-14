// letterGrid.ts — Grille de notation par lettres (A+/A/B+/B/C+/C/D+/—) — V2 port TS
//
// Ported from services/letter_grid.py (Python v2). Pas de LLM, pas de % converti :
// la lettre naît directement des statuts des critères.
//
// Contrat :
//   computeMethodLetter(criteria)    → 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+'
//   computeScienceLetter(status)     → '✅' | '🔴' | '⚠️'
//   computeOverallLetter(method, science, stuffing, darija) → LetterOutput
//   formatDisplay(result)            → { lines: string[]; overall: string }
//
// Convention de poids : poids_fort ≥ 3 (impact majeur sur la méthode).
// Un critère "error" est traité comme "empty" (le fond est absent, pas partiel).

export type CriterionStatus = 'full' | 'partial' | 'empty' | 'error';

export interface CriterionInput {
  id: string;
  status: CriterionStatus;
  weight: number;
  required: boolean;
}

export interface LetterOutput {
  methodLetter: string | null;    // A+ → D+, null = ungraded
  scienceLetter: string | null;   // ✅ | 🔴 | ⚠️ | null
  overallLetter: string | null;   // A+ → D+, null = ungraded
  ceilings: Record<string, string>;
  nextStepAr: string;
}

export interface LetterDisplay {
  lines: string[];
  overall: string;
}

const LETTER_ORDER: Record<string, number> = {
  'A+': 0, 'A': 1, 'B+': 2, 'B': 3, 'C+': 4, 'C': 5, 'D+': 6,
};

const SCIENCE_LETTER_MAP: Record<string, string> = {
  ok: '✅',
  error: '🔴',
  partial: '⚠️',
};

const POIDS_FORT_THRESHOLD = 3;

function isPoidsFort(weight: number): boolean {
  return weight >= POIDS_FORT_THRESHOLD;
}

/**
 * Statistiques de critères requis et optionnels.
 */
function countStatus(items: CriterionInput[], status: CriterionStatus): number {
  return items.filter(c => c.status === status).length;
}

/**
 * Calculer la lettre méthode depuis les statuts des critères.
 *
 * Décision tree (définitif, ordre non négociable) :
 *
 * 1. ≥ 2 requis empty/error  → D+
 * 2. 1 requis empty/error     → C si poids_fort, C+ si poids_faible
 * 3. ≥ 2 requis partial       → C+
 * 4. 1 requis partial         → C+ si poids_fort, B+ si poids_faible
 * 5. ≥ 1 optional empty/error  → C+
 * 6. ≥ 2 optional partial     → B+
 * 7. 1 optional partial       → A
 * 8. sinon                    → A+
 *
 * NOTE : opt_empty (étape 5) précède opt_partial (étape 6-7) —
 * un critère vide en optionnel pénalise plus qu'un partiel.
 */
export function computeMethodLetter(criteria: CriterionInput[]): string {
  const req = criteria.filter(c => c.required);
  const opt = criteria.filter(c => !c.required);

  const reqEmpty   = countStatus(req, 'empty') + countStatus(req, 'error');
  const reqPartial = countStatus(req, 'partial');
  const optEmpty   = countStatus(opt, 'empty') + countStatus(opt, 'error');
  const optPartial = countStatus(opt, 'partial');

  if (reqEmpty >= 2) return 'D+';

  if (reqEmpty === 1) {
    const crit = req.find(c => c.status === 'empty' || c.status === 'error')!;
    return isPoidsFort(crit.weight) ? 'C' : 'C+';
  }

  if (reqPartial >= 2) return 'C+';

  if (reqPartial === 1) {
    const crit = req.find(c => c.status === 'partial')!;
    return isPoidsFort(crit.weight) ? 'C+' : 'B+';
  }

  if (optEmpty >= 1) return 'C+';

  if (optPartial >= 2) return 'B+';

  if (optPartial === 1) return 'A';

  return 'A+';
}

/**
 * Lettre science : ✅ (ok) | 🔴 (erreur grave) | ⚠️ (warnings/partial).
 */
export function computeScienceLetter(status: string): string | null {
  return SCIENCE_LETTER_MAP[status] ?? null;
}

/**
 * Lettre overall = méthode plafonnée par les caps actifs.
 *
 * Caps :
 *   - science 🔴  → plafond D+ (erreur scientifique grave)
 *   - stuffing     → plafond C+ (bourrage lexical détecté)
 *   - darija       → plafond B si méthode ∈ {A+, A, B+}, sinon méthode (pas d'effet)
 *
 * La lettre la plus restrictive (indice LETTER_ORDER le plus grand) l'emporte.
 */
export function computeOverallLetter(
  methodLetter: string,
  scienceLetter: string | null,
  stuffingDetected: boolean,
  darijaDetected: boolean,
): LetterOutput {
  const ceilings: Record<string, string> = {};

  if (scienceLetter === '🔴') {
    ceilings.science = 'D+';
  }

  if (stuffingDetected) {
    ceilings.stuffing = 'C+';
  }

  if (darijaDetected) {
    if (['A+', 'A', 'B+'].includes(methodLetter)) {
      ceilings.darija = 'B';
    } else {
      ceilings.darija = methodLetter;
    }
  }

  let overall = methodLetter;
  for (const ceiling of Object.values(ceilings)) {
    const cOrder = LETTER_ORDER[ceiling] ?? 99;
    const oOrder = LETTER_ORDER[overall] ?? 99;
    if (cOrder > oOrder) overall = ceiling;
  }

  const nextStepAr: string = computeNextStep(methodLetter, scienceLetter, stuffingDetected, darijaDetected, ceilings);

  return { methodLetter, scienceLetter, overallLetter: overall, ceilings, nextStepAr };
}

/**
 * Message next_step en arabe pour l'élève, selon le verdict.
 */
function computeNextStep(
  method: string | null,
  science: string | null,
  stuffing: boolean,
  darija: boolean,
  ceilings: Record<string, string>,
): string {
  if (method === null || science === null) {
    return 'هذه الإجابة غير كافية للتقييم. أعد كتابتها بالعربية وضع سؤالك بوضوح.';
  }

  const parts: string[] = [];

  if (ceilings.science === 'D+') {
    parts.push('توجد خطأ علمي جسيم يمنع أي تقدم — راجع المعلومة الأساسية لتكون دقيقة قبل أي ربط.');
  }

  if (ceilings.stuffing === 'C+') {
    parts.push('الإجابة تكرر نفس الكلمات كثيراً دون إضافة معنى — وسع المحتوى العلمي بدل التكرار.');
  }

  if (ceilings.darija && ceilings.darija !== method) {
    parts.push('الصياغة أقرب إلى الدارجة من الفصحى العلمية — انتقل إلى الجمل الإخبارية الدقيقة بلغة المقررات.');
  }

  if (method === 'D+' || method === 'C') {
    parts.push('ركز على الخطوات الأساسية (استخراج + ربط + خاتمة) قبل أي تحسين.');
  } else if (method === 'C+' || method === 'B') {
    parts.push('تحسّن الربط السببي بين المعطيات والمكتسبات، وأضف خاتمة تجيب عن الهدف.');
  } else if (method === 'B+') {
    parts.push('أضف دقة في الصياغة: وحدات، أسماء علمية دقيقة، رابط سببي صريح.');
  } else if (method === 'A') {
    parts.push('ممتاز — لكي تصل إلى A+، أضف نُكتَة علمية دقيقة أو ربطاً تراكمياً بين المعطيات.');
  } else if (method === 'A+') {
    parts.push('أداء استثنائي. للوصول إلى الم하길ّ (laureate)، ابحث عن زاوية لم تُذكر في السؤال.');
  }

  return parts.join(' ');
}

/**
 * Affichage 3 lignes pour l'élève — labels en arabe, RTL-ready.
 *
 * Retourne toujours { lines, overall }.
 * Les plafonds affichés sont :
 *   - les plafonds actifs (ceiling_letter différent de method_letter)
 *   - les plafonds en égalité avec la méthode (ex: stuffing sur copie C+) — signal de contexte
 * Les autres (ceiling_letter > method_letter, ex: darija B sur méthode C+) sont masqués.
 */
export function formatDisplay(result: LetterOutput): LetterDisplay {
  const methodStr  = result.methodLetter  ?? '—';
  const scienceStr = result.scienceLetter ?? '—';
  const overallStr = result.overallLetter  ?? '—';

  const ceilingParts: string[] = [];
  for (const [name, letter] of Object.entries(result.ceilings)) {
    const cOrder = LETTER_ORDER[letter] ?? 99;
    const mOrder = LETTER_ORDER[result.methodLetter ?? 'D+'] ?? 99;
    if (cOrder > mOrder) {
      ceilingParts.push(`مُقَيَّد بـ ${name} → ${letter}`);
    } else if (letter === result.methodLetter && result.methodLetter != null) {
      ceilingParts.push(`${name} مكتشف (معدل ${letter})`);
    }
  }

  const lines: string[] = [
    `المنهجية: ${methodStr}`,
    `العلم: ${scienceStr}`,
  ];

  if (ceilingParts.length > 0) {
    lines.push(`العام: ${overallStr}  (${ceilingParts.join(' · ')})`);
  } else {
    lines.push(`العام: ${overallStr}  (بدون قيد)`);
  }

  return { lines, overall: overallStr };
}
