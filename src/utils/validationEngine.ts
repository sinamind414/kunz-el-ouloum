// validationEngine.ts
// Moteur de validation offline-first pour la Formation Manhadjiya Express (Jour 0).
// Réutilise normalizeArabic (src/utils/arabicNormalize.ts) — aucune dépendance externe.
// Principe: regex + normalisation arabe + synonymes AR/FR pour valider les réponses ouvertes.

import { normalizeArabic } from './arabicNormalize';

/** Règles de validation d'un champ / d'une réponse de module. */
export interface ValidationRules {
  /** Tous ces mots-clés (ou un de leurs synonymes) doivent être présents. */
  requiredKeywords?: string[];
  /** Aucun de ces mots ne doit apparaître (ex: لأن، ربما). */
  forbiddenWords?: string[];
  /** La réponse doit contenir au moins un chiffre. */
  mustContainNumbers?: boolean;
  /** La réponse doit contenir au moins une unité (ثا، mg، %، ...). */
  mustContainUnits?: boolean;
  /** Au moins un de ces mots-cibles doit apparaître (ex: إنزيم/مستقبل/قناة). */
  mustContainTargetAny?: string[];
  /** Longueur minimale (caractères, texte brut). */
  minLength?: number;
}

export interface ValidationResult {
  valid: boolean;
  /** Score 0..1 (part des contraintes satisfaites). */
  score: number;
  /** Messages d'aide en arabe (ce qui manque / ce qui est interdit). */
  messagesAr: string[];
  /** Mots-clés requis manquants (forme lisible). */
  missing: string[];
  /** Mots interdits détectés. */
  forbiddenHit: string[];
}

/**
 * Synonymes AR/FR : chaque entrée regroupe des formes équivalentes.
 * Utilisé pour que "مستقبل" matche "مستقبل غشائي", "récepteur", etc.
 */
export const SYNONYMS: Record<string, string[]> = {
  'مستقبل': ['مستقبل غشائي', 'مستقبل نيكوتيني', 'recepteur', 'récepteur'],
  'انزيم': ['إنزيم', 'انزيم', 'enzyme'],
  'قناة': ['قناة ايونية', 'قناة أيونية', 'canal', 'canal ionique'],
  'يمثل': ['يمثل', 'تمثل', 'represente', 'représente'],
  'بدلاله': ['بدلالة', 'en fonction de', 'en fonction'],
  'يزداد': ['يرتفع', 'يتزايد', 'augmente'],
  'ينقص': ['ينخفض', 'يتناقص', 'diminue'],
  'ثابت': ['مستقر', 'constant', 'stable'],
  'المستوى الجزيئي': ['المستوى الجزيئي', 'niveau moleculaire', 'niveau moléculaire'],
  'المستوى الخلوي': ['المستوى الخلوي', 'niveau cellulaire'],
  'مما يدل على': ['مما يدل على', 'ce qui montre', 'ce qui indique'],
};

/** Unités fréquentes en SVT (recherche insensible à la casse/normalisée). */
const UNIT_TOKENS = [
  'ثا', 'ثانيه', 'ثانية', 'دقيقه', 'دقيقة', 'ساعه', 'ساعة',
  'مل', 'لتر', 'غ', 'ملغ', 'مول', 'جول', 'فولط', 'ميلي',
  'mg', 'ml', 'mol', 'mv', 's', 'min', 'g', 'l', 'µm', 'mm', 'cm', 'kj', 'j',
  'درجه', 'درجة', '%', '٪',
];

/** Développe un mot-clé vers l'ensemble de ses formes normalisées (lui + synonymes). */
function expandForms(keyword: string): string[] {
  const forms = new Set<string>();
  const nk = normalizeArabic(keyword);
  forms.add(nk);
  // Cherche le groupe de synonymes dont la clé ou un membre correspond.
  for (const [key, syns] of Object.entries(SYNONYMS)) {
    const all = [key, ...syns].map((s) => normalizeArabic(s));
    if (all.includes(nk)) {
      all.forEach((f) => forms.add(f));
    }
  }
  return Array.from(forms).filter(Boolean);
}

function containsAnyForm(normInput: string, keyword: string): boolean {
  return expandForms(keyword).some((form) => form && normInput.includes(form));
}

/**
 * Valide une réponse ouverte selon des règles.
 * @param rawInput texte brut saisi par l'élève
 * @param rules contraintes du module
 */
export function validateAnswer(rawInput: string, rules: ValidationRules): ValidationResult {
  const raw = (rawInput || '').trim();
  const norm = normalizeArabic(raw);
  const messagesAr: string[] = [];
  const missing: string[] = [];
  const forbiddenHit: string[] = [];

  let constraints = 0;
  let satisfied = 0;

  // 1) Longueur minimale
  if (rules.minLength != null) {
    constraints++;
    if (raw.length >= rules.minLength) satisfied++;
    else messagesAr.push(`أضف تفاصيل أكثر (على الأقل ${rules.minLength} حرفاً).`);
  }

  // 2) Chiffres obligatoires
  if (rules.mustContainNumbers) {
    constraints++;
    if (/[0-9\u0660-\u0669]/.test(raw)) satisfied++;
    else messagesAr.push('أدرج قيماً رقمية دقيقة.');
  }

  // 3) Unités obligatoires
  if (rules.mustContainUnits) {
    constraints++;
    const hasUnit = UNIT_TOKENS.some((u) => {
      if (u === '%' || u === '٪') return raw.includes(u);
      return norm.includes(normalizeArabic(u));
    });
    if (hasUnit) satisfied++;
    else messagesAr.push('لا تنسَ الوحدات (ثا، ملغ، %، ...).');
  }

  // 4) Mots-clés requis (avec synonymes)
  if (rules.requiredKeywords && rules.requiredKeywords.length) {
    for (const kw of rules.requiredKeywords) {
      constraints++;
      if (containsAnyForm(norm, kw)) {
        satisfied++;
      } else {
        missing.push(kw);
      }
    }
    if (missing.length) {
      messagesAr.push(`أدرج العناصر الأساسية: ${missing.join('، ')}.`);
    }
  }

  // 5) Au moins une cible moléculaire
  if (rules.mustContainTargetAny && rules.mustContainTargetAny.length) {
    constraints++;
    const hit = rules.mustContainTargetAny.some((t) => containsAnyForm(norm, t));
    if (hit) satisfied++;
    else messagesAr.push(`حدّد الهدف الجزيئي بدقة: ${rules.mustContainTargetAny.join(' / ')}.`);
  }

  // 6) Mots interdits
  if (rules.forbiddenWords && rules.forbiddenWords.length) {
    constraints++;
    for (const fw of rules.forbiddenWords) {
      if (norm.includes(normalizeArabic(fw))) forbiddenHit.push(fw);
    }
    if (forbiddenHit.length === 0) {
      satisfied++;
    } else {
      messagesAr.push(`تجنّب العبارات: ${forbiddenHit.join('، ')}.`);
    }
  }

  const score = constraints === 0 ? 1 : satisfied / constraints;
  // Valide si toutes les contraintes sont satisfaites (aucun manquant, aucun interdit).
  const valid = missing.length === 0 && forbiddenHit.length === 0 && satisfied === constraints;

  if (valid && messagesAr.length === 0) {
    messagesAr.push('إجابة منهجية سليمة! أحسنت.');
  }

  return { valid, score, messagesAr, missing, forbiddenHit };
}
