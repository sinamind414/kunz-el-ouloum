// missionManager.ts
// Formation Manhadjiya Express — architecture "1 ouverture = 1 mission" (M0..M5).
// Non surchargé : 5-12 min par mission, déblocage progressif sur 6 jours.
// Arabe fousha uniquement, chiffres français, offline-first (localStorage).

export type MissionStatus = 'done' | 'current' | 'locked';

export interface Mission {
  id: string; // M0..M5
  titleAr: string; // عربية فصحى
  titleFr: string; // FR ok
  loiKunz: string; // Loi Kunz #0..#5
  duration: number; // 5-12 min
  xp: number; // 10-30
  status: MissionStatus;
  completedAt?: string; // ISO
}

const MISSIONS_DEF: Omit<Mission, 'status' | 'completedAt'>[] = [
  { id: 'M0', titleAr: 'التعرف على الوثيقة', titleFr: 'Identifier', loiKunz: 'Loi Kunz #0 - التعرف أولا', duration: 5, xp: 10 },
  { id: 'M1', titleAr: 'الوصف', titleFr: 'Décrire', loiKunz: 'Loi Kunz #1 - قيمة + وحدة', duration: 6, xp: 10 },
  { id: 'M2', titleAr: 'التحليل', titleFr: 'Analyser', loiKunz: 'Loi Kunz #2 - 4 étapes', duration: 7, xp: 15 },
  { id: 'M3', titleAr: 'التفسير', titleFr: 'Interpréter', loiKunz: 'Loi Kunz #3 - 3 niveaux aide', duration: 7, xp: 15 },
  { id: 'M4', titleAr: 'الفرضية', titleFr: 'Hypothèse', loiKunz: 'Loi Kunz #4 - نفترض أن', duration: 6, xp: 20 },
  { id: 'M5', titleAr: 'المصادقة والتركيب', titleFr: 'Valider + Schéma', loiKunz: 'Loi Kunz #5-6 - 3 Blocs + jugement + schéma', duration: 12, xp: 30 },
];

export const STORAGE_KEY = 'kunz_missions_v2';
export const LAST_OPEN_KEY = 'kunz_last_mission_date';
export const DONE_KEY = 'kunz_manhadjiya_done';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, val: string): void {
  try {
    localStorage.setItem(key, val);
  } catch {
    /* offline-first : silencieux */
  }
}

function buildDefaults(): Mission[] {
  return MISSIONS_DEF.map((m, i) => ({
    ...m,
    status: i === 0 ? 'current' : 'locked',
  }));
}

/** Recalcule les statuts pour garantir exactement 1 'current'. */
function normalize(missions: Mission[]): Mission[] {
  const done = new Set(missions.filter((m) => m.status === 'done').map((m) => m.id));
  let assignedCurrent = false;
  return MISSIONS_DEF.map((def) => {
    const existing = missions.find((m) => m.id === def.id);
    if (done.has(def.id)) {
      return { ...def, status: 'done' as MissionStatus, completedAt: existing?.completedAt };
    }
    if (!assignedCurrent) {
      assignedCurrent = true;
      return { ...def, status: 'current' as MissionStatus };
    }
    return { ...def, status: 'locked' as MissionStatus };
  });
}

export function loadMissions(): Mission[] {
  // Rétro-compat : si l'ancienne formation Jour 0 était terminée, on marque tout fait.
  if (isManhadjiyaDone()) {
    const all = MISSIONS_DEF.map((m) => ({ ...m, status: 'done' as MissionStatus }));
    saveMissions(all);
    return all;
  }

  let stored: Mission[] | null = null;
  try {
    const raw = safeGet(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw) as Mission[];
  } catch {
    stored = null;
  }
  if (!stored || !Array.isArray(stored) || stored.length !== MISSIONS_DEF.length) {
    const init = buildDefaults();
    saveMissions(init);
    return init;
  }
  return normalize(stored);
}

export function saveMissions(missions: Mission[]): void {
  safeSet(STORAGE_KEY, JSON.stringify(missions));
}

export function getCurrentMission(missions: Mission[]): Mission | undefined {
  return missions.find((m) => m.status === 'current');
}

/** Une mission par jour (sauf bypass via allowExtraToday). */
export function canDoMissionToday(missions: Mission[]): boolean {
  const last = safeGet(LAST_OPEN_KEY);
  if (last !== todayStr()) return true;
  const doneToday = missions.filter(
    (m) => m.status === 'done' && m.completedAt && m.completedAt.slice(0, 10) === todayStr()
  ).length;
  return doneToday < 1;
}

export function isManhadjiyaDone(): boolean {
  return safeGet(DONE_KEY) === 'true';
}

/**
 * Complète la mission `id`. Met à jour statut + completedAt + LAST_OPEN_KEY.
 * Si allowExtraToday=false et la mission du jour est déjà faite → bloque (return null).
 * Si toutes terminées → pose DONE_KEY='true'.
 */
export function completeMission(id: string, allowExtraToday = false): Mission[] | null {
  const missions = loadMissions();
  const target = missions.find((m) => m.id === id);
  if (!target) return null;
  if (!allowExtraToday && !canDoMissionToday(missions)) return null;

  const completedAt = new Date().toISOString();
  const updated = missions.map((m) =>
    m.id === id ? { ...m, status: 'done' as MissionStatus, completedAt } : m
  );

  // Prochaine mission non faite -> current
  const hasUndone = updated.some((m) => m.status !== 'done');
  if (hasUndone) {
    const next = updated.find((m) => m.status !== 'done');
    if (next) next.status = 'current';
  }

  saveMissions(updated);
  safeSet(LAST_OPEN_KEY, todayStr());

  if (!hasUndone) safeSet(DONE_KEY, 'true');
  return updated;
}

export function getMissionsProgress(missions: Mission[]): { done: number; total: number } {
  return {
    done: missions.filter((m) => m.status === 'done').length,
    total: MISSIONS_DEF.length,
  };
}

/** Réinitialise la formation (debug / nouvelle tentative). */
export function resetMissions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_OPEN_KEY);
    localStorage.removeItem(DONE_KEY);
  } catch {
    /* silencieux */
  }
}
