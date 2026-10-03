// src/data/gestureChapterMatrix.ts
// Audit 03102026, idée 4 — la matrice Geste × Chapitre (transfert).
//
// PROBLÈME (audit 03102026, p12) :
//   « Le lien est Programme → Leçon. Le lien Geste → Chapitre n'est explicité
//   nulle part : l'élève ne sait pas que دليل sert en immunité comme en génétique. »
//   Le geste est donc appris sur UN contexte, puis ne réapparaît jamais.
//
// C'est exactement le défaut que signale aussi l'audit Morchid : la méthode est
// une compétence TRANSVERSALE, mais le parcours la confine dans l'unité où on
// l'a rencontrée. Le jour du BAC, l'élève ne réactive pas le geste parce qu'il
// ne l'a jamais vu dans un autre chapitre.
//
// SOLUTION (cette idée) : une matrice qui dit, pour chaque geste MIFTah, dans
// quels chapitres il se rejoue — et avec quel support concret. Elle alimente
// deux usages :
//   1. Fin de séance (rappel actif S-05) : « ce même geste se rejoue en X ».
//   2. La boucle de rappel (idée 1) : quand un geste est dû, on le rejoue
//      dans un AUTRE chapitre que celui de la première acquisition.
//
// Invariant pédagogique : un geste ne se déclare dans un chapitre que si on
// peut nommer le document précis sur lequel il s'exerce. Sinon c'est du
// verbiage de pédagogue, pas du transfert.

import type { GestureId } from '../lib/parcours/gestureRecallEngine';

export interface GestureChapterAnchor {
  /** La phrase-type de consigne BAC qui déclenche le geste dans CE chapitre. */
  bacPromptAr: string;
  /** Le support concret (document) sur lequel le geste s'exerce. */
  supportAr: string;
}

export interface MatrixCell {
  /** Identifiant geste MIFTah. */
  gestureId: GestureId;
  /** Identifiant d'unité (parcours officiel, cf unitOpenings.ts). */
  unitId: number;
  /** Ancrage concret dans ce chapitre. */
  anchor: GestureChapterAnchor;
}

// Les 11 unités du programme BAC SVT (cf src/data/unitOpenings.ts) :
// 1 آليات تركيب البروتين · 2 بنية ووظيفة البروتين · 3 النشاط الإنزيمي
// 4 دفاع الذات (immunité) · 5 الاتصال العصبي · 6 التركيب الضوئي
// 7 تحويل الطاقة · 8 ما فوق البنية الخلوية · 9 النشاط التكتوني
// 10 بنية الكرة الأرضية · 11 البنيات الجيولوجية
export const GESTURE_CHAPTER_MATRIX: MatrixCell[] = [
  // ── دليل (Prouver : extraire une preuve) — geste le plus transversal ──
  { gestureId: 'verb_prouver', unitId: 3, anchor: {
    bacPromptAr: 'استخرج من الوثيقة 1 القيمة العظمى للسرعة مع وحدتها.',
    supportAr: 'منحنى تركيز الركيزة (الجدول 1)', } },
  { gestureId: 'verb_prouver', unitId: 4, anchor: {
    bacPromptAr: 'استخرج من الوثيقة 2 المدة الفاصلة بين حقن المستضد وارتفاع الأجسام المضادة.',
    supportAr: 'منحنى تطور كمية الأجسام المضادة', } },
  { gestureId: 'verb_prouver', unitId: 6, anchor: {
    bacPromptAr: 'أعطِ قيمتي الأكسجين المنطلق في الضوء وفي الظلام.',
    supportAr: 'تجربة الأكسجين في الأنبوبين', } },
  { gestureId: 'verb_prouver', unitId: 11, anchor: {
    bacPromptAr: 'استخرج من الوثيقة 3 سرعة انسحاب الشاطئ على مدى 50 سنة.',
    supportAr: 'خريطة معدلات الانسحاب', } },

  // ── علاقة (Relier : chaîne causale) ──
  { gestureId: 'verb_relier', unitId: 3, anchor: {
    bacPromptAr: 'فسّر استقرار السرعة عند إضافة كمية فائضة من الركيزة.',
    supportAr: 'منحنى Vmax مع المواقع النشطة', } },
  { gestureId: 'verb_relier', unitId: 4, anchor: {
    bacPromptAr: 'فسّر سبب تعافي المريض بسرعة عند حقن مصل يحوي أجسامًا مضادة جاهزة.',
    supportAr: 'سيناريو المصلة والأجسام المضادة', } },
  { gestureId: 'verb_relier', unitId: 5, anchor: {
    bacPromptAr: 'فسّر سبب توقف النقل العصبي بعد زوال النواقل من الشقّ المشبكي.',
    supportAr: 'مخطط الشق المشبكي', } },
  { gestureId: 'verb_relier', unitId: 6, anchor: {
    bacPromptAr: 'فسّر انطلاق الأكسجين في وريقات نبات معرّض للضوء.',
    supportAr: 'التحلل الضوئي للماء (المرحلة الكيميوضوئية)', } },

  // ── فعل (Agir : répondre au verbe) ──
  { gestureId: 'verb_agir', unitId: 1, anchor: {
    bacPromptAr: 'حلل الوثيقة 1 ثم فسر دور ARNt.',
    supportAr: 'مخطط الاستنساخ والترجمة', } },
  { gestureId: 'verb_agir', unitId: 4, anchor: {
    bacPromptAr: 'حلل المنحنى 2 ثم استنتج طبيعة الاستجابة المناعية.',
    supportAr: 'منحنى الاستجابة الأولية والثانوية', } },
  { gestureId: 'verb_agir', unitId: 9, anchor: {
    bacPromptAr: 'قارن بين حركة الصفائح في المحيط وبين القارة.',
    supportAr: 'خريطة الصفائح التكتونية', } },

  // ── جواب (Conclure : phrase-bilan) ──
  { gestureId: 'verb_conclure', unitId: 2, anchor: {
    bacPromptAr: 'استنتج العلاقة بين بنية البروتين ووظيفته.',
    supportAr: 'البنية الثالثية ولمُكوّنات', } },
  { gestureId: 'verb_conclure', unitId: 7, anchor: {
    bacPromptAr: 'استنتج وجهة الطاقة المحررة من تكسّر الجلوكوز.',
    supportAr: 'مخطط التنفس الخلوي (ATP)', } },
  { gestureId: 'verb_conclure', unitId: 10, anchor: {
    bacPromptAr: 'استنتج توزيع البنيات الجيولوجية على سطح الأرض.',
    supportAr: 'خريطة الجبال البركانية', } },

  // ── step0 (Comprendre : STEP0 avant toute donnée) ──
  { gestureId: 'step0_comprendre', unitId: 1, anchor: {
    bacPromptAr: 'بعد قراءة السند: ما الهدف العام (≤ 5 كلمات)؟ ومن أين تأتي الإجابة؟',
    supportAr: 'أي سند الاستنساخ', } },
  { gestureId: 'step0_comprendre', unitId: 4, anchor: {
    bacPromptAr: 'بعد قراءة السند: ما الهدف العام (≤ 5 كلمات)؟ ومن أين تأتي الإجابة؟',
    supportAr: 'أي سند الاستجابة المناعية', } },
];

/**
 * Pour un geste donné, la liste des chapitres où il se rejoue.
 * C'est l'outil du « transfert » : le geste n'est plus la propriété d'un
 * chapitre, il est une compétence qui s'applique.
 */
export function chaptersForGesture(gestureId: GestureId): MatrixCell[] {
  return GESTURE_CHAPTER_MATRIX.filter((cell) => cell.gestureId === gestureId);
}

/**
 * Le prochain chapitre où rejouer un geste, en changeant de contexte.
 * Renvoie une cellule DANS UNE AUTRE unité que l'unité d'origine — sinon
 * l'élève rejoue le même exercice et ce n'est plus du transfert.
 */
export function nextTransferForGesture(
  gestureId: GestureId,
  currentUnitId: number,
): MatrixCell | null {
  const others = chaptersForGesture(gestureId).filter((c) => c.unitId !== currentUnitId);
  if (others.length === 0) return null;
  // rotation déterministe pour ne pas toujours tomber sur le même chapitre
  const seed = (currentUnitId * 7 + others.length) % others.length;
  return others[seed];
}

/**
 * Vérifie que chaque geste déclaré dans la matrice est bien un geste MIFTah
 * géré par la boucle de rappel (cohérence référentielle idée 1 ↔ idée 4).
 */
export function matrixGestureIds(): GestureId[] {
  const seen: GestureId[] = [];
  GESTURE_CHAPTER_MATRIX.forEach((c) => {
    if (!seen.includes(c.gestureId)) seen.push(c.gestureId);
  });
  return seen;
}
