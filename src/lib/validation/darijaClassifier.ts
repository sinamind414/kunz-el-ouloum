// darijaClassifier.ts — Détection de registre دارجة / فصحى (port TS purgé v2.1)
//
// PURGE v2.1 (audit D4) : la liste héritée était corrompue — tokens mojibake
// (تRAV, نashes, مضoglyphique…) ET mots فصحى courants classés à tort دارجة
// (كانت, تعمل, يفهم, يدور…) qui classaient les copies correctes en MIXTE.
// La liste ci-dessous est alignée sur la référence purgée
// (ARCHIVE_SINAMIND/CORRECTEUR LOCAL SANS LLM/services/register_classifier.py v2.1).
//
// Matching (contrairement à la v1) :
//   · DARJA  → mot EXACT (token === marqueur) : un marqueur fermé ne doit pas
//     matcher en sous-chaîne («الهادئ» contient «هاد» mais n'est PAS دارجة).
//   · فصحى   → sous-chaîne (stems scientifiques : الميتوكوندري matche الميتوكوندريا).
//   Seuls les marqueurs MONO-MOTS sont listés : le matching par token ne peut
//   jamais matcher une expression multi-mots («باش يروح», «ما يخليهش»…).
//
// La détection est CONSULTATIVE (pas de cap darija automatique côté élève —
// décision enseignant via correctionQueue). Seuils = référence Python v2.1
// (register_classifier.py, signatures DÉDUPLIQUÉES) :
//   - ≥ 3 marqueurs دارجة distincts → DARIJA
//   - 1-2 marqueurs → MIXTE (un «باش» isolé n'est plus de la فصحى d'examen)
//   - 0 marqueur → FUSHHA

import { normalizeAr } from './normalizeAr';

export interface RegisterResult {
  classe: 'FUSHHA' | 'DARIJA' | 'MIXTE';
  score: number;            // jarida_score 0..100 (marqueurs distincts / mots)
  jarida_markers_found: string[];
  fushha_markers_found: string[];
  recommandation_ar: string;
  explanation_ar: string;
}

/**
 * Marqueurs دارجة mono-mots (référence : register_classifier.py v2.1, purge D4).
 * Critère : attestés en Algérie, absents des manuels SVT et de la فصحى d'examen.
 */
const DARJA_MOTS: string[] = [
  // 1re pers. pluriel « ن + verbe » (parler algérien)
  'نديرو', 'نشوفو', 'نصيرو', 'ناكلو', 'ننامو', 'نسمعو', 'نحسو',
  'نغيرو', 'نزيدو', 'نلو', 'نقللو',
  // Marqueurs algériens attestés
  'بزاف', 'كيفاش', 'واش', 'واشر', 'باش', 'عشان', 'هاد', 'هاك',
  'هاكا', 'هاكي', 'ديال', 'تاع', 'تاعي', 'ماكاين', 'كاين', 'ماكو',
  'غادي', 'غادو', 'بارح', 'خلاص', 'صير', 'صيروا', 'صارت',
  'ياخو', 'ياخا', 'يارح', 'زور', 'زوار', 'مغارنة', 'كمان',
  'ابغى', 'شالا', 'شالو', 'منو', 'منهاش',
];

/**
 * Marqueurs فصحى scientifiques mono-mots/stems (manuels SVT algériens).
 * Servent au classement positif FUSHHA (≥ 2 marqueurs → فصحى probable).
 */
const FUSHHA_MOTS: string[] = [
  // Cytologie (manuels SVT DZ)
  'الهيولى', 'السيتوبلازم', 'الميتوكوندريا', 'الميتوكوندري', 'المصفوفة',
  'الغشاء', 'النواة', 'الريبوزوم', 'الحويصلة', 'الليزوزوم',
  // Verbes scientifiques des réponses modèles BAC
  'يظهر', 'نلاحظ', 'نعرف', 'نحدد', 'نستنتج', 'نفسر',
  'نقارن', 'نحلل', 'نبين', 'نوضح', 'نستخرج', 'عديمة',
  // Connecteurs causaux فصحى
  'بالتالي', 'بسبب', 'لذلك', 'وعليه', 'لكن', 'أما', 'بينما', 'حيث',
  // Notations
  'ATP', 'ADN', 'ARN',
  // Quantificateurs
  'يساوي', 'تساوي', 'تزيد', 'تزداد', 'تقل', 'ينقص',
];

// Marqueurs précalculés en forme normalisée (harakat/ة/ى repliées)
const DARJA_NORM = new Set(DARJA_MOTS.map(normalizeAr));
const FUSHHA_NORM = FUSHHA_MOTS.map(normalizeAr).filter(Boolean);

/**
 * Détecter le registre d'une copie arabe (normalisée ou brute).
 *
 * Algorithme (référence Python v2.1) :
 *   1. Tokenizer (mots de ≥ 2 lettres, sur texte normalisé).
 *   2. DARJA : matching par mot EXACT. فصحى : matching par sous-chaîne (stem).
 *   3. Seuils sur les marqueurs دارجة DISTINCTS :
 *      ≥ 3 → DARIJA · 1-2 → MIXTE · 0 → FUSHHA.
 *   4. score = pourcentage de mots دارجة (informatif, pas un seuil).
 *
 * NOTE : détection CONSULTATIVE — aucun cap darija automatique n'en découle.
 */
export function detecterRegistre(normalizedText: string): RegisterResult {
  const norm = normalizeAr(normalizedText);
  const tokens = norm
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length >= 2);

  const totalMots = tokens.length;
  if (totalMots === 0) {
    return {
      classe: 'FUSHHA',
      score: 0,
      jarida_markers_found: [],
      fushha_markers_found: [],
      recommandation_ar: 'النص فارغ — لا يمكن تحديد السجل.',
      explanation_ar: 'أعد كتابة الإجابة.',
    };
  }

  const jaridaFound = new Set<string>();
  const fushhaFound = new Set<string>();

  for (const token of tokens) {
    // DARJA : mot exact (marqueur fermé — jamais en sous-chaîne)
    if (DARJA_NORM.has(token)) jaridaFound.add(token);
    // فصحى : stem en sous-chaîne (الميتوكوندري ⊂ الميتوكوندريا)
    for (const f of FUSHHA_NORM) {
      if (token.includes(f)) fushhaFound.add(f);
    }
  }

  const nbJarida = jaridaFound.size;
  const nbFushha = fushhaFound.size;
  const jaridaScore = (nbJarida / totalMots) * 100;

  let classe: 'FUSHHA' | 'DARIJA' | 'MIXTE';
  if (nbJarida >= 3) {
    classe = 'DARIJA';
  } else if (nbJarida >= 1) {
    classe = 'MIXTE';
  } else {
    classe = 'FUSHHA';
  }

  const recommandation_ar = classe === 'DARIJA'
    ? 'إجابة بأسلوب دارج — استعمل اللغة الفصحى العلمية كما في الكتب المدرسية (مثال: بدل «يروح» اكتب «ينتقل»).'
    : classe === 'MIXTE'
      ? 'إجابة مختلطة — وحّد الأسلوب الفصحي في الأجزاء العلمية.'
      : 'إجابة بأسلوب علمي فصيح — جيد. أكثر من الربط السببي بقواعد الدرس.';

  const classeAr = classe === 'DARIJA' ? 'دارجة' : classe === 'MIXTE' ? 'مختلط' : 'فصحى';
  const explanation_ar =
    `تم تحليل ${totalMots} كلمة:\n` +
    `- ماركات دارجة: ${nbJarida} (${[...jaridaFound].join('، ')})\n` +
    `- ماركات فصحى علمية: ${nbFushha} (${[...fushhaFound].join('، ')})\n` +
    `النسبة الدارجية: ${Math.round(jaridaScore)}%\n` +
    `→ التصنيف: ${classeAr}`;

  return {
    classe,
    score: jaridaScore,
    jarida_markers_found: [...jaridaFound],
    fushha_markers_found: [...fushhaFound],
    recommandation_ar,
    explanation_ar,
  };
}
