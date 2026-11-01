// src/data/meftahLaw.ts — « law.json » : LA LOI UNIQUE du مفتاح (audit V4.3 + rapports 1-2).
//
// Une seule source pour : le mur TahlilWall, ValidationEngine (via normalizeAr/containsAny)
// et le fading. Génère la face 2 de la carte (tables verbes) par dérivation — jamais de copie.
//
// Contrat (docs/MARQUE.md + audits) :
//   - Chaque token porte rationale + source + sévérité. Le gate ne compte QUE le rouge.
//   - « Interdit » est un raccourci de langage : le feedback dit « déplacé » (كلمة تفسير في مكان تحليل),
//     jamais « illégal » — évite la sur-généralisation qui coûterait des points en استنتاج/خاتمة.
//   - Deux patrons d'analyse coexistent : covariation (كلما) ET comparaison (بينما/في حين).
//     « Absence de كلما = incomplet » est FAUX pour une comparaison (incohérence §6/§8 des rapports).
//   - Sources : L3 = LIVRE MANHADJIYA.md (guide officiel), BAC2025 = sujet 1 corrigé,
//     MANHADJIYA-INSPECTION = doctrine d'inspection assumée (échafaudage auteur si non sourcée).
//     Chaque entrée à réviser porte reviewedBy (audit 2 §4.6 : véracité biologique par enseignant SVT).

import { normalizeAr, containsAny } from '../lib/validation/normalizeAr';

// ─── Sévérité ─────────────────────────────────────────────────────────────────

export type Severity = 'red' | 'amber';

/** Famille de marqueurs de la loi. Un seul endroit, toutes les variantes. */
export interface LawMarkerFamily {
  id: string;
  /** Nom lisible (arabe) pour les feedbacks. */
  labelAr: string;
  /** Pourquoi déplacé/interdit : UNE ligne, lisible par l'élève (audit 1 §4.4 « le pourquoi à un tap »). */
  rationaleAr: string;
  /** Provenance de la norme (audit 1 R4a / audit 2 C2 : sourcer ou assumer). */
  source: 'L3' | 'BAC2025' | 'MANHADJIYA-INSPECTION';
  /** red = compte dans le gate. amber = déconseillé, signalé, jamais bloquant. */
  severity: Severity;
  /** Toutes les variantes admises (diacritiques/hamza/clitiques gérés par normalizeAr). */
  variants: string[];
  /** Où le marqueur est LÉGITIME — la séance de dé-généralisation s'appuie dessus. */
  legitimateInAr: string;
}

// ─── Les familles de marqueurs (la loi) ───────────────────────────────────────

export const LAW_MARKER_FAMILIES: LawMarkerFamily[] = [
  {
    id: 'dalal',
    labelAr: 'هذا يدل (الإدلال)',
    rationaleAr: 'هذه الكلمة تفتح الباب للسبب — في حلّل يبحث المصحح عن التغير المقيس، لا عن السبب.',
    source: 'L3',
    severity: 'red',
    variants: ['هذا يدل', 'تدل على', 'مما يدل', 'الأمر الذي يدل', 'يدل على ذلك', 'وهذا يعني ان', 'هذا يعني ان'],
    legitimateInAr: 'استنتج · خاتمة النص العلمي · علّق',
  },
  {
    id: 'sabab',
    labelAr: 'لأن / بسبب (السببية)',
    rationaleAr: 'لأن تربط النتيجة بسببها — هذا شغل فسّر، يأتي بعد التحليل لا داخله.',
    source: 'L3',
    severity: 'red',
    variants: ['لان', 'لان', 'بسبب', 'نتيجة ل', 'نظرا ل'],
    legitimateInAr: 'فسّر · علّل · برّر · خاتمة الاستدلال',
  },
  {
    id: 'tafsir-verb',
    labelAr: 'يفسَّر بـ / تفسير (verbe de tafsir)',
    rationaleAr: 'صيغة التفسير تعلن السبب — في حلّل نصف المتغيرات بقيمها فقط.',
    source: 'L3',
    severity: 'red',
    variants: ['يفسر ب', 'تفسر ب', 'يفسر ذلك', 'تفسر ذلك', 'مفسرا ب', 'نفس ب'],
    legitimateInAr: 'فسّر · التفسير بعد التحليل في التحليل المقارن إن طلب السياق',
  },
  {
    id: 'rajac',
    labelAr: 'راجع إلى (le renvoi causal)',
    rationaleAr: 'راجع إلى تربط الملاحظة بالسبب — من كلمات فسّر، تُستعمل بعد التحليل.',
    source: 'BAC2025',
    severity: 'red',
    variants: ['راجع إلى', 'راجع الى', 'يرجع إلى', 'يرجع الى', 'يعود ذلك إلى', 'يعود الى ذلك', 'وهذا راجع إلى', 'وهذا راجع الى'],
    legitimateInAr: 'فسّر · صيغة التفسير الرسمية (نعلم أن… وهذا راجع إلى…)',
  },
  {
    id: 'shak',
    labelAr: 'ربما / لعل (صيغ الشك في الفرضية)',
    rationaleAr: 'الفرضية جملة إخبارية جازمة قابلة للاختبار — ربما تجعلها أمنية لا فرضية.',
    source: 'L3',
    severity: 'red',
    variants: ['ربما', 'ربما', 'لعل', 'قد يكون', 'يحتمل', 'من الممكن ان', 'من الممكن أن'],
    legitimateInAr: 'لا مكان — رفضت في ورقة الامتحان (لا المشافهة)',
  },
  {
    id: 'generic-openers',
    labelAr: 'مقدمة « عموما » (bourgage d\'ouverture)',
    rationaleAr: 'التحليل يبدأ بتعريف الوثيقة مباشرة — العبارات العامة تستهلك النقطة لا المعنى.',
    source: 'MANHADJIYA-INSPECTION',
    severity: 'amber',
    variants: ['من المعروف ان', 'من المعروف أن', 'كما نعلم جميعا', 'عموما يمكن القول'],
    legitimateInAr: 'خارج التحليل تماما',
  },
];

// ─── Les deux patrons d'analyse (incohérence §6/§8 corrigée) ──────────────────

export type AnalysisPattern = 'covariation' | 'comparaison';

export interface AnalysisPatternSpec {
  id: AnalysisPattern;
  labelAr: string;
  /** Mots caractéristiques du patron — servent au feedback, pas au scoring. */
  markersAr: string[];
  templateAr: string;
  whenAr: string;
}

export const ANALYSIS_PATTERNS: AnalysisPatternSpec[] = [
  {
    id: 'covariation',
    labelAr: 'التغاير (كلما)',
    markersAr: ['كلما', 'طردية', 'عكسية'],
    templateAr: 'فكلما زاد … نقص/زاد … (علاقة طردية أو عكسية) من … إلى … [الوحدة]',
    whenAr: 'منحنى أو جدول بمتغيرين يتغيران معًا',
  },
  {
    id: 'comparaison',
    labelAr: 'المقارنة (بينما / في حين)',
    markersAr: ['بينما', 'في حين', 'يقابله', 'عند المقارنة'],
    templateAr: 'في الحالة X تبلغ … [القيمة+الوحدة]، بينما في الحالة Y …',
    whenAr: 'شكلان أو حالتان أو مجموعة تجريبية/شاهد',
  },
];

// ─── Familles d'items du mur (audit 1 R2 / audit 2 B : désindexer la tâche) ───

/** Classe d'indice de surface : explicit = marqueur visible ; none = mécanisme nu ; misleading = piège. */
export type CueKind = 'explicit' | 'none' | 'misleading';

/** Les 6 familles du pool (audit 2 §B) — les familles 3-6 prouvent la compréhension. */
export const WALL_ITEM_FAMILIES = [
  { id: 'F1', labelAr: 'تحليل بقيم (chiffrée)', cue: 'explicit' as CueKind },
  { id: 'F2', labelAr: 'تفسير برابط (explicite)', cue: 'explicit' as CueKind },
  { id: 'F3', labelAr: 'تحليل نوعي بلا أرقام', cue: 'none' as CueKind },
  { id: 'F4', labelAr: 'تفسير عارٍ (mécanisme sans connecteur)', cue: 'none' as CueKind },
  { id: 'F5', labelAr: 'خليط: أرقام + كلمة تفسير', cue: 'misleading' as CueKind },
  { id: 'F6', labelAr: 'صديق كاذب: يبيّن/نلاحظ وصفي', cue: 'none' as CueKind },
] as const;

export type WallItemFamilyId = (typeof WALL_ITEM_FAMILIES)[number]['id'];

// ─── API du matcher (une seule loi, mur + engine + fade) ──────────────────────

/** Tokens RED du bloc tahlil uniquement (le gate ne compte que ces variantes). */
export const TAHLIL_RED_VARIANTS: string[] = LAW_MARKER_FAMILIES
  .filter((f) => f.severity === 'red' && f.id !== 'shak')
  .flatMap((f) => f.variants);

/** Détecte la 1re famille rouge présente dans un texte (null si aucune).
 *  NB : shak (ربما…) est EXCLU du contexte tahlil — il ne concerne que le bloc فرضية. */
export function detectDisplacedCausal(raw: string): LawMarkerFamily | null {
  const norm = normalizeAr(raw);
  for (const fam of LAW_MARKER_FAMILIES) {
    if (fam.severity !== 'red' || fam.id === 'shak') continue;
    for (const v of fam.variants) {
      if (norm.includes(normalizeAr(v))) return fam;
    }
  }
  return null;
}

/** Détecte une variante de صيغ الشك (ربما…) — bloc فرضية uniquement. */
export function detectHedging(raw: string): LawMarkerFamily | null {
  const norm = normalizeAr(raw);
  const fam = LAW_MARKER_FAMILIES.find((f) => f.id === 'shak')!;
  for (const v of fam.variants) {
    if (norm.includes(normalizeAr(v))) return fam;
  }
  return null;
}

/** Tous les marqueurs (red + amber) — pour l'affichage riche du ValidationEngine. */
export function detectAllMarkers(raw: string): LawMarkerFamily[] {
  const norm = normalizeAr(raw);
  return LAW_MARKER_FAMILIES.filter((fam) =>
    fam.variants.some((v) => norm.includes(normalizeAr(v)))
  );
}

/** Le patron d'analyse détecté dans une production (feedback, pas scoring). */
export function detectAnalysisPattern(raw: string): AnalysisPatternSpec | null {
  const has = (tokens: string[]) => containsAny(raw, tokens);
  if (has(ANALYSIS_PATTERNS[0].markersAr)) return ANALYSIS_PATTERNS[0];
  if (has(ANALYSIS_PATTERNS[1].markersAr)) return ANALYSIS_PATTERNS[1];
  return null;
}

export const LAW_VERSION = '1.0' as const;
