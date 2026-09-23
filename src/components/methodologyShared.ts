// Constantes partagées — extrait de MethodologyCompilerView (F9 god components).
// Aucune réécriture de libellés : TONE/ATELIERS/icm/REVIEW_GAPS identiques à l'original.
import React from 'react';
import { Zap, BookOpen, Layers, FileText, Compass, Key, ShieldAlert } from 'lucide-react';
import { MIFTAH_VERSION, MIFTAH_NAME_OFFICIAL_AR, Switch } from '../data/methodologyEngine';
import type { SwitchLine } from '../utils/methodologyScorer';

// B1 · tons du rapport + libellés interrupteur au niveau module (le bloc « 4 étapes » les lit hors closure)
const TONE = {
  red:     'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-200',
  amber:   'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200',
  muted:   'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400',
} as const;
type ToneKey = keyof typeof TONE;
const switchTone = (s: SwitchLine): ToneKey =>
  s.violated ? 'red'
  : s.choiceCorrect === false ? 'amber'
  : 'emerald';
const swAr = (s: Switch): string => (s === 'open' ? 'مفتوح' : 'مغلق');

// ─── Ateliers du  — nom officiel via MIFTAH_NAME_OFFICIAL_AR — owner 2026-09-15 ────────────────────────
// La barre d'onglets défilante est remplacée par une grille d'icônes : les 7
// ateliers demandés sont visibles d'un coup, sans scroll horizontal.
type AtelierId =
  | 'simulator' | 'verbs_ref' | 'mastery_matrix' | 'correction'
  | 'engine_rules' | 'boussole_card' | 'meftah' | 'tahlil_wall';

interface AtelierDef {
  id: AtelierId;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ATELIERS: AtelierDef[] = [
  { id: 'simulator',      label: 'الخطوات الأربع',                 hint: 'المحاكي · 4 مراحل',      icon: Zap },
  { id: 'verbs_ref',      label: 'فهرس الأفعال الثمانية والنماذج', hint: 'بطاقات الأفعال + نماذج', icon: BookOpen },
  { id: 'mastery_matrix', label: 'مصفوفة الإتقان',                 hint: 'الخلايا وتحليل الأخطاء', icon: Layers },
  { id: 'correction',     label: 'المصححة',                        hint: 'ملف التصحيح',            icon: FileText },
  { id: 'engine_rules',   label: 'قواعد الإجابة الـ 4 (الطبقة 0)', hint: 'الطبقة 0 · البوابات',    icon: Compass },
  { id: 'meftah',         label: `${MIFTAH_NAME_OFFICIAL_AR} + BAC 2025`, hint: `v${MIFTAH_VERSION} · 3 وجوه + تطبيق`, icon: Key },
  { id: 'tahlil_wall',    label: 'جدار حلّل — التدريب',            hint: 'تحليل أم تفسير؟',        icon: ShieldAlert },
];

// m2 · seuil d'automatisation unique (code + texte d'aide)
const AUTOMATION_THRESHOLD = 90;
const icmLabel = (icm: number | null): string => icm === null ? '' : icm < 60 ? 'ضعيف' : icm < 90 ? 'متوسط' : 'ممتاز';
const icmLabelFr = (icm: number | null): string => icm === null ? '' : icm < 60 ? 'faible' : icm < 90 ? 'moyen' : 'fort';

const REVIEW_GAPS = [1, 3, 7, 16, 30];

export { TONE, switchTone, swAr, ATELIERS, AUTOMATION_THRESHOLD, icmLabel, icmLabelFr, REVIEW_GAPS };
export type { ToneKey, AtelierId, AtelierDef };
