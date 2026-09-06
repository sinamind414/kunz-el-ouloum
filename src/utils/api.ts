const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || '';

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
    body: JSON.stringify({ email, password, name }),
  });
}

export async function loginStudent(email: string, password: string) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchMe() {
  return request('/api/auth/me');
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
    body: JSON.stringify({ email, password }),
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
