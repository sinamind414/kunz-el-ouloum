// sanctionsCorrecteur.ts — Sanctions pédagogiques dérivées du DICTIONNAIRE FINAL.
//
// Sources build : faux_amis (confusions sanctionnables + double-sens) et conflits
// (atp_bilan_respiration). Décision correcteur (2026-09-14) : pour le bilan
// respiratoire, la valeur retenue est UNIQUEMENT 38 ATP/glucose — une réponse qui
// pose 30/32/30-32/36/37 est taguée CONFLIT_REF avec rappel du barème officiel DZ
// (livre 8, حصيلة التنفس L9843). Le décompte ATP n'a jamais été demandé aux BAC
// 2023-2025 (contexte_bac du build) — le tag est donc préventif.
// Les double-sens (Km, matrice, noyau) restent des alertes « vigilance » : jamais
// pénalisants (règle moteur du build : flag AMBIGUITE_LEXICALE).
// Détection sur le texte normalisé (normalizeAr) : hamzas unifiées, casse latine libre.

import { normalizeAr } from '../../lib/validation/normalizeAr';

export type SanctionGravite = 'forte' | 'vigilance';

export interface Sanction {
  type: 'FAUX_AMI' | 'CONFLIT_REF' | 'VIGILANCE';
  id: string;
  gravite: SanctionGravite;
  titreAr: string;
  /** Ce qui a déclenché la sanction dans la réponse. */
  constatAr: string;
  /** La règle à appliquer / la correction attendue. */
  correctionAr: string;
}

// ── Déclencheurs (sur texte normalisé + minuscule) ───────────────────────────

// Faux ami « courbe_michaelis_forme » : aucune entité Michaelis dans le build —
// graphies couvertes : مايكاليس / مايكليس / مايكل / ميكاليس / Michaelis / Menten.
const RE_MICHAELIS = /مايك|ميكال|michaelis|menten|مينتن|منتن/;
// « جرسية الشكل » → normalisé « جرسيه الشكل » ; « en cloche » latin.
const RE_CLOCHE = /جرسي|الجرس|cloche/;

// Faux ami « hemoglobine_vs_globule » : HbA (molécule) vs GR (cellule).
const RE_HEMOGLOBINE = /هيموغلوب|هيمغلوب|hba|(^| )hb( |$)/;
const RE_SPHERIQUE = /كروي|مستدير|كوره/;
// AUDIT 2026-09-16 : contexte « cellule » — la phrase décrit le GLOBULE
// (ex. « الكريه الحمراء خلية … تحتوي الهيموغلوبين ») : co-occurrence légitime,
// on dégrade la sanction en vigilance. « forte » réservée aux réponses qui
// attribuent la forme cellulaire au MOLÉCULE sans contexte cellulaire clair.
const RE_CONTEXTE_CELLULE = /خلية|خلوه|كريه|كريات|الدم|خلايا/;

// Conflit « atp_bilan_respiration » — valeurs modernes NON acceptées (décision).
// AUDIT 2026-09-16 : PRÉ-CONDITION de contexte énergétique. Le seul nombre
// 30/32/36/37 isolé (température 37°, numéro de document, année…) ne déclenche
// PLUS la sanction — il faut en plus ATP / حصيلة / غلوكوز dans la réponse.
const RE_ATP_MAUVAISE = /(^| )(30|32|36|37)( |$)|30 [-–—]?32/;
const RE_CONTEXTE_ATP = /atp|حصيله|حصيلة|غلوكوز|جلوكوز/;

// Vigilance « km_kilometre_vs_michaelis » : Km + contexte enzymatique.
const RE_KM = /(^| )km( |$)/;
const RE_ENZYME = /انزيم|تاكسد|مايك|michaelis|affinite/;

// Vigilance « matrice_double_sens » : المصفوفة (D2U2) ET القالبية/المستنسخة (D1U1).
const RE_MATRICE = /مصفوف/;
const RE_BRIN = /قالبي|مستنسخ/;

// Vigilance « noyau_double_sens » : النواة (D1) ET اللب (D3).
const RE_NOYAU = /النواة|النواه|نواة الخليه/;
const RE_LB = /اللب|لب الارض/;

/**
 * Analyse les sanctions pédagogiques d'une réponse.
 * forte = confusion sanctionnable / conflit de référence ; vigilance = simple
 * signal advisory (double-sens), jamais pénalisant.
 */
export function evaluerSanctions(reponse: string): Sanction[] {
  const brut = reponse || '';
  if (!brut.trim()) return [];
  const norm = normalizeAr(brut).toLowerCase();
  const out: Sanction[] = [];

  if (RE_MICHAELIS.test(norm) && RE_CLOCHE.test(norm)) {
    out.push({
      type: 'FAUX_AMI',
      id: 'courbe_michaelis_forme',
      gravite: 'forte',
      titreAr: 'منحنى مايكاليس-مينتن وصف بأنه «جرسي الشكل»',
      constatAr: 'وصف منحنى مايكاليس-مينتن بالشكل الجرسي خلط بين منحنيات التشبع ومنحنيات pH/الحرارة.',
      correctionAr: 'منحنى مايكاليس-مينتن = تشبع زائدي (هضبة عند Vmax). الشكل الجرسي يعود لمنحنيات pH/درجة الحرارة فقط — JAMAIS لمايكاليس.',
    });
  }

  if (RE_HEMOGLOBINE.test(norm) && RE_SPHERIQUE.test(norm)) {
    // AUDIT 2026-09-16 : « forte » uniquement si le MOLÉCULE semble qualifié de
    // cellule sans contexte cellulaire ; si la réponse parle bien de la cellule
    // (كريه/خلية/الدم), la co-occurrence est légitime → vigilance.
    const contexteCellule = RE_CONTEXTE_CELLULE.test(norm);
    out.push({
      type: 'FAUX_AMI',
      id: 'hemoglobine_vs_globule',
      gravite: contexteCellule ? 'vigilance' : 'forte',
      titreAr: 'خلط بين الجزيء (HbA) والخلية (الكريه الحمراء)',
      constatAr: 'وصف الهيموغلوبين بالشكل الكروي قد يعني اعتباره خلية — وهو بروتين.',
      correctionAr: 'الكريه الحمراء = خلية مقعرة الوجهين (ثنائية التقعر)؛ HbA = بروتين رباعي الوحدات (جزيء). تُقبل «المنجلية» للكريه المصاب بفقر الدم المنجلي.',
    });
  }

  if (RE_ATP_MAUVAISE.test(norm) && RE_CONTEXTE_ATP.test(norm)) {
    out.push({
      type: 'CONFLIT_REF',
      id: 'atp_bilan_respiration',
      gravite: 'forte',
      titreAr: 'حصيلة التنفس — قيمة ATP غير المقررة',
      constatAr: 'وردت في الإجابة قيمة حديثة (30-32 أو 36/37 ATP لكل غلوكوز) مع ذكر ATP.',
      correctionAr: 'القيمة المقررة رسميا: 38 ATP لكل غلوكوز (حصيلة التنفس — الكتاب المدرسي L9843). تُقبل 38 فقط في الحصيلة. ملاحظة: الحصيلة الكمية لم تُطلب في BAC 2023-2025.',
    });
  }

  if (RE_KM.test(norm) && RE_ENZYME.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'km_kilometre_vs_michaelis',
      gravite: 'vigilance',
      titreAr: '«Km» مزدوجة المعنى',
      constatAr: 'وردت Km في سياق إنزيمي: تأكد أنها ثابتة مايكاليس (قرابة تأثير الإنزيم بالوسط).',
      correctionAr: 'في الجيولوجيا (D3) Km = كيلومترات؛ في الإنزيميات Km = ثابتة مايكاليس (تأثير). لفظ واحد لمعنيين — وضّح السياق.',
    });
  }

  if (RE_MATRICE.test(norm) && RE_BRIN.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'matrice_double_sens',
      gravite: 'vigilance',
      titreAr: '«ماتريس» مزدوجة المعنى',
      constatAr: 'الإجابة تجمع المصفوفة (ميتوكوندريا) والسلسلة القالبية/المستنسخة (ADN).',
      correctionAr: 'المصفوفة = matrice mitochondriale (D2U2)؛ السلسلة القالبية/المستنسخة = brin matrice (D1U1). مصطلحان مختلفان رغم الترجمة الفرنسية المشتركة.',
    });
  }

  if (RE_NOYAU.test(norm) && RE_LB.test(norm)) {
    out.push({
      type: 'VIGILANCE',
      id: 'noyau_double_sens',
      gravite: 'vigilance',
      titreAr: '«نواة/لب» مزدوجة المعنى',
      constatAr: 'الإجابة تجمع النواة الخلوية (D1) ولب الأرض (D3).',
      correctionAr: 'النواة = noyau cellulaire (D1U1)؛ اللب = noyau terrestre (D3). تأكد من السياق لتجنب اللبس بين المجالين.',
    });
  }

  return out;
}