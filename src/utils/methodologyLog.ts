// ============================================================
// Carnet de bord pédagogique — production log (offline, localStorage)
// Chaque production écrite de l'élève (brouillon + note + critères
// + erreurs détectées) est archivée localement pour permettre un
// vrai diagnostic de progression dans le temps.
// 100% local : aucune donnée ne quitte l'appareil de l'élève.
// ============================================================

// M4 · source unique des libellés : dérivé de ERROR_TAXONOMY (pas de quatrième liste manuelle)
import { ERROR_TAXONOMY, getVerbCardV2 } from '../data/methodologyEngine';

export interface ProductionLogEntry {
  id: string;
  verbId: string;
  verbAr: string;
  theme?: string;          // ex: 'protein_synthesis'
  stage: 2 | 3 | 4;        // 2 = complétion (cloze), 3/4 = production rédigée
  dateISO: string;         // horodatage
  text: string;            // le brouillon complet de l'élève
  icm: number;             // 0-100 (indice de conformité méthodologique)
  criteriaSummary: { label: string; passed: boolean }[];
  errorTags: string[];     // erreurs détectées par le scoreur
  durationSec?: number;    // temps passé (mode sprint)
}

export interface VerbEvolutionStats {
  verbId: string;
  verbAr: string;
  attempts: number;
  last: number;
  previous: number | null;
  delta: number | null;        // + / - (note dernière - avant-dernière)
  best: number;
  average: number;
  spark: number[];             // dernières 10 notes (chronologique)
  topErrors: { tag: string; count: number }[];
  masteredThemes: number;      // thèmes distincts avec ICM ≥ 90
}

const STORAGE_KEY = 'kunz_methodology_production_log_v1';
const MAX_ENTRIES = 300; // rotation : jamais plus de 300 productions archivées

/**
 * B (docs/AUDIT_APPROCHE_APP.md §3.8) : la « cellule » de la matrice est un RATIO
 * GLISSANT de binaires du scoreur — jamais un % inventé.
 * Pour un verbe : sur les N dernières productions, la part sans l'erreur TYPIQUE du verbe.
 * ratio = null quand il n'y a pas encore de production (l'absence de donnée n'est pas 0 %).
 */
export function verbSlidingRatio(
  verbId: string,
  windowSize = 10,
  logs: ProductionLogEntry[] = getProductionLogs(),
): { total: number; clean: number; ratio: number | null } {
  const card = getVerbCardV2(verbId);
  const tag = card?.typicalErrorTag ?? null;
  const recent = logs.filter(l => l.verbId === verbId).slice(-windowSize);
  if (recent.length === 0) return { total: 0, clean: 0, ratio: null };
  const clean = tag ? recent.filter(l => !l.errorTags.includes(tag)).length : recent.length;
  return { total: recent.length, clean, ratio: Math.round((clean / recent.length) * 100) };
}

function safeRead(): ProductionLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidEntry) : [];
  } catch (e) {
    console.warn('Carnet de bord illisible — réinitialisation:', e);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    return [];
  }
}

function isValidEntry(e: unknown): e is ProductionLogEntry {
  if (!e || typeof e !== 'object') return false;
  const o = e as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.verbId === 'string' && typeof o.icm === 'number';
}

export function logProduction(entry: Omit<ProductionLogEntry, 'id' | 'dateISO'>): void {
  try {
    const full: ProductionLogEntry = {
      ...entry,
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      dateISO: new Date().toISOString(),
    };
    const all = safeRead();
    all.push(full);
    // Rotation : on garde les plus récentes, mais on ne perd jamais plus
    // de 3 brouillons par verbe (pour préserver la comparaison).
    if (all.length > MAX_ENTRIES) {
      all.splice(0, all.length - MAX_ENTRIES);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('Impossible d’archiver la production:', e);
  }
}

export function getProductionLogs(): ProductionLogEntry[] {
  return safeRead().sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}

/** Dernière production (brouillon) pour un verbe — pour « reprendre où on s'était arrêté ». */
export function getLatestDraft(verbId: string): ProductionLogEntry | null {
  const all = safeRead().filter(e => e.verbId === verbId);
  if (!all.length) return null;
  return all.sort((a, b) => b.dateISO.localeCompare(a.dateISO))[0];
}

/** Statistiques d'évolution pour un verbe. */
export function getVerbEvolution(verbId: string): VerbEvolutionStats | null {
  const all = safeRead()
    .filter(e => e.verbId === verbId)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  if (!all.length) return null;

  const scores = all.map(e => e.icm);
  const last = scores[scores.length - 1];
  const previous = scores.length > 1 ? scores[scores.length - 2] : null;

  // Erreurs récurrentes (le vrai diagnostic : savoir si l'élève répète les mêmes fautes)
  const errCount: Record<string, number> = {};
  all.forEach(e => e.errorTags.forEach(t => { errCount[t] = (errCount[t] || 0) + 1; }));
  const topErrors = Object.entries(errCount)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Règle d'automatisation affichée dans l'app : ICM ≥ 90 dans ≥ 3 unités différentes
  const themes90 = new Set(all.filter(e => e.icm >= 90 && e.theme).map(e => e.theme as string));

  return {
    verbId,
    verbAr: all[all.length - 1].verbAr,
    attempts: all.length,
    last,
    previous,
    delta: previous === null ? null : last - previous,
    best: Math.max(...scores),
    average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    spark: scores.slice(-10),
    topErrors,
    masteredThemes: themes90.size,
  };
}

export function getAllVerbStats(verbIds: string[]): VerbEvolutionStats[] {
  return verbIds
    .map(id => getVerbEvolution(id))
    .filter((s): s is VerbEvolutionStats => s !== null);
}

export function clearProductionLog(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

export const ERROR_TAG_LABELS_AR: Record<string, string> = Object.fromEntries(
  Object.values(ERROR_TAXONOMY).map(e => [e.code, e.nameAr])
);

export interface NavigatorGrade {
  key: 'none' | 'deckhand' | 'sailor' | 'captain' | 'admiral';
  nameAr: string;
  icon: string;
  conditionAr: string;
}

export function getNavigatorGrade(): NavigatorGrade {
  const logs = getProductionLogs();
  if (logs.length === 0) {
    return {
      key: 'none',
      nameAr: 'مبتدئ الإبحار',
      icon: '🌫️',
      conditionAr: 'أكمل أول رحلة NSOE (بثول واحد مُقيَّم) لتحصل على رتبتك',
    };
  }

  const verbAcc: Record<string, { sum: number; n: number }> = {};
  const themes90 = new Set<string>();
  let cleanRun = false;
  logs.forEach(l => {
    const acc = verbAcc[l.verbId] || (verbAcc[l.verbId] = { sum: 0, n: 0 });
    acc.sum += l.icm; acc.n += 1;
    if (l.icm >= 90 && l.theme) themes90.add(l.theme);
    if (l.errorTags.length === 0) cleanRun = true;
  });
  const verbs75 = Object.values(verbAcc).filter(v => v.sum / v.n >= 75).length;

  if (themes90.size >= 3) {
    return {
      key: 'admiral',
      nameAr: 'قبطان أعالي البحار',
      icon: '⚓',
      conditionAr: 'ICM ≥ 90% في 3 وحدات مختلفة على الأقل',
    };
  }
  if (verbs75 >= 3) {
    return {
      key: 'captain',
      nameAr: 'رُبّان',
      icon: '🚢',
      conditionAr: 'متوسط ≥ 75% في 3 أفعال أداء مختلفة',
    };
  }
  if (logs.length >= 5 && cleanRun) {
    return {
      key: 'sailor',
      nameAr: 'ملاح',
      icon: '⛵',
      conditionAr: '5 رحلات مكتملة + رحلة واحدة بلا خطأ منهجي',
    };
  }
  return {
    key: 'deckhand',
    nameAr: 'نوتيّ',
    icon: '🛶',
    conditionAr: 'أولى الرحلات — واصل الإبحار لتكتسب الرتب',
  };
}
