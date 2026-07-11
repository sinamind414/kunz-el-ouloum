// methodologyChecker.ts
// Pilier 2 — Le "Correcteur Ministériel" Local (100% offline, 0 réseau).
// Toutes les fonctions scannent le texte via String.includes() / regex,
// sans aucune dépendance externe ni LLM.

export interface MethodologyStepResult {
  valid: boolean;
  message: string;
}

// Mots de cause formellement interdits dans une "تحليل" (analyse pure, pas d'interprétation).
export const FORBIDDEN_ANALYSIS_WORDS = ['لأن', 'بسبب', 'راجع إلى', 'وذلك راجع'];

// Mots interdits dans une "hypothèse" (on exige une cause explicite via يعود السبب إلى).
export const FORBIDDEN_HYPOTHESIS_WORDS = ['ربما'];

/**
 * 1. Validation du Micro-test "Mot par mot" (Pilier 1).
 * Retourne true si l'un des mots acceptés est présent dans la production de l'élève.
 */
export function checkProduction(text: string, accepted: string[]): boolean {
  if (!text || !accepted || accepted.length === 0) return false;
  const normalized = text.trim().toLowerCase();
  return accepted.some((ans) => normalized.includes(ans.trim().toLowerCase()));
}

/**
 * 2. Validation des mots-clés du barème officiel (Pilier 2).
 */
export function checkMethodologyStep(
  text: string,
  requiredKeywords: string[]
): MethodologyStepResult {
  if (!text || text.trim().length === 0) {
    return { valid: false, message: 'الرجاء إدخال إجابة' };
  }
  if (!requiredKeywords || requiredKeywords.length === 0) {
    return { valid: true, message: 'إجابة منهجية ممتازة' };
  }
  const missing = requiredKeywords.filter((kw) => !text.includes(kw));
  return {
    valid: missing.length === 0,
    message:
      missing.length > 0
        ? `الكلمات المفقودة: ${missing.join('، ')}`
        : 'إجابة منهجية ممتازة',
  };
}

/**
 * 3. Le Pénalisateur de l'Analyse (interdiction d'interpréter).
 * Retourne false si l'élève utilise un mot de cause (donc il interprète au lieu d'analyser).
 */
export function checkAnalysisPurity(text: string): boolean {
  if (!text) return true;
  return !FORBIDDEN_ANALYSIS_WORDS.some((w) => text.includes(w));
}

/**
 * Règle de l'Hypothèse : interdit le mot "ربما" et exige "يعود السبب إلى".
 */
export function checkHypothesis(text: string): MethodologyStepResult {
  if (!text || text.trim().length === 0) {
    return { valid: false, message: 'الرجاء صياغة الفرضية' };
  }
  const usesMaybe = FORBIDDEN_HYPOTHESIS_WORDS.some((w) => text.includes(w));
  const usesProperCause = text.includes('يعود السبب إلى');
  if (usesMaybe) {
    return { valid: false, message: 'خطأ منهجي: تجنب كلمة "ربما" واستعمل "يعود السبب إلى".' };
  }
  if (!usesProperCause) {
    return { valid: false, message: 'خطأ منهجي: يجب أن تبدأ الفرضية بـ "يعود السبب إلى".' };
  }
  return { valid: true, message: 'فرضية منهجية صحيحة' };
}

/**
 * 4. Règle du "Problème Scientifique" (تنتهي بـ ؟ et commence par un mot interrogatif).
 */
export function checkScientificProblem(text: string): boolean {
  if (!text) return false;
  const t = text.trim();
  const startsWithQuestionWord = /^(كيف|لماذا|أين|متى|ما هو|ما هي)/.test(t);
  const endsWithQuestionMark = t.endsWith('؟');
  return startsWithQuestionWord && endsWithQuestionMark;
}

/**
 * Règle du "Texte Scientifique" (Pilier 2, doc d'architecture) :
 * intro finissant par ؟, corps avec mots-clés, conclusion < 150 caractères.
 */
export function checkScientificText(
  intro: string,
  body: string,
  conclusion: string,
  bodyKeywords: string[]
): boolean {
  const introValid =
    (intro.trim().endsWith('؟') && /^(كيف|ما هي|ما هو|لماذا|أين|متى)/.test(intro.trim())) ||
    intro.startsWith('كيف') ||
    intro.startsWith('ما هي');
  const bodyValid = checkMethodologyStep(body, bodyKeywords).valid;
  const conclusionValid = conclusion.trim().length > 10 && conclusion.trim().length < 150;
  return introValid && bodyValid && conclusionValid;
}

/**
 * Calcule si un clic (en %) est dans la zone correcte du hotspot.
 * Toutes les coordonnées sont en pourcentage 0-100 par rapport à l'image.
 */
export function isInsideHotspot(
  clickX: number,
  clickY: number,
  zone: { x: number; y: number; radius: number }
): boolean {
  const dx = clickX - zone.x;
  const dy = clickY - zone.y;
  return Math.sqrt(dx * dx + dy * dy) <= zone.radius;
}
