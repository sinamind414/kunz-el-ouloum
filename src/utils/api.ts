/** Base API : vide par défaut (même origine, Vercel+APK web), ou
 *  VITE_API_URL (APK release : URL serveur en dur, ex. https://…vercel.app). */
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || '';

/** Email normalisé (trim + minuscules) — miroir de la règle serveur. */
const normalizeEmail = (email: string) => (email || '').trim().toLowerCase();

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'request_failed');
  return data;
}

export function setApiToken(token: string | null) {
  if (!token) localStorage.removeItem('boussole_token');
  else localStorage.setItem('boussole_token', token);
}

export function getApiToken(): string | null {
  return localStorage.getItem('boussole_token');
}

export async function registerStudent(email: string, password: string, name: string) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: normalizeEmail(email), password, name }),
  });
}

/**
 * Connexion : accepte le CODE DE CONNEXION (comptes sans e-mail) ou une
 * adresse e-mail (comptes existants). Le serveur tranche — l'interface n'a
 * pas à deviner ce que l'élève a tapé, et ne lui impose pas de choisir.
 */
export async function loginStudent(identifiant: string, password: string) {
  const valeur = (identifiant || '').trim();
  const estEmail = valeur.includes('@');
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(
      estEmail ? { email: normalizeEmail(valeur), password } : { identifiant: valeur, password },
    ),
  });
}

/**
 * Inscription SANS adresse e-mail — le chemin par défaut, parce que la
 * majorité des élèves n'ont pas d'adresse (et n'en veulent pas).
 * Le serveur renvoie `{ token, code: "XXXX-XXXX", student }` : le code est
 * affiché UNE SEULE FOIS, c'est la clé de connexion de l'élève.
 * `codeSecret` = 6 chiffres (et non un mot de passe à inventer puis oublier).
 */
export async function registerStudentCode(name: string, codeSecret: string) {
  return request('/api/auth/register-code', {
    method: 'POST',
    body: JSON.stringify({ name: (name || '').trim(), pin: (codeSecret || '').trim() }),
  });
}

/**
 * Vérifie le jeton courant AUPRÈS du serveur.
 * · envoie bien le header Authorization (correctif bug critique — sans lui,
 *   le serveur répond 401 et l'appareil effaçait le jeton après chaque login) ;
 * · seule une 401 « jeton refusé » est distinguée (err.status) pour que
 *   l'appelant puisse couper la session — un échec réseau/5xx ne la détruit pas
 *   (l'app est offline-first).
 */
export async function fetchMe(): Promise<{
  student: { id: string; name: string; email: string | null; code?: string | null };
}> {
  const token = getApiToken();
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401) {
    const err = new Error('unauthorized') as Error & { status?: number };
    err.status = 401;
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'request_failed');
  return data;
}

export async function syncEntries(entries: Array<Record<string, unknown>>, events: Array<Record<string, unknown>> = []) {
  const token = getApiToken();
  return request('/api/student/sync', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ entries, events }),
  });
}

export async function logActivity(type: 'quiz' | 'mission' | 'drill' | 'production', payload: Record<string, unknown>) {
  const token = getApiToken();
  return request('/api/student/activity', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ type, payload }),
  });
}

export async function requestPasswordReset(code: string, newPassword: string) {
  return request('/api/student/reset-password', {
    method: 'POST',
    body: JSON.stringify({ code, password: newPassword }),
  });
}

export async function requestTeacherPasswordReset(studentId: string) {
  const token = getTeacherApiToken();
  return request('/api/teacher/reset-password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ studentId }),
  });
}

export async function fetchTeacherExport(studentId?: string) {
  const token = localStorage.getItem('boussole_teacher_token');
  const url = studentId ? `/api/teacher/export/csv?studentId=${encodeURIComponent(studentId)}` : '/api/teacher/export/csv';
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('export_failed');
  return res.blob();
}

export async function fetchStudentEntries() {
  const token = getApiToken();
  return request('/api/student/entries', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function setTeacherApiToken(token: string | null) {
  if (!token) localStorage.removeItem('boussole_teacher_token');
  else localStorage.setItem('boussole_teacher_token', token);
}

export function getTeacherApiToken(): string | null {
  return localStorage.getItem('boussole_teacher_token');
}

export async function loginTeacher(email: string, password: string) {
  return request('/api/teacher/login', {
    method: 'POST',
    body: JSON.stringify({ email: normalizeEmail(email), password }),
  });
}

export async function fetchTeacherDashboard() {
  const token = localStorage.getItem('boussole_teacher_token');
  return request('/api/teacher/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchTeacherEntries(studentId: string) {
  const token = localStorage.getItem('boussole_teacher_token');
  return request(`/api/teacher/entries?studentId=${encodeURIComponent(studentId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
