export type MethodologyRemediationFeedbackStatus = 'practiced' | 'blocked';

export interface MethodologyRemediationFeedbackEntry {
  status: MethodologyRemediationFeedbackStatus;
  updatedAt: number;
}

const STORAGE_KEY = 'kunz_methodology_remediation_feedback_v1';

function isFeedbackStatus(value: unknown): value is MethodologyRemediationFeedbackStatus {
  return value === 'practiced' || value === 'blocked';
}

function isFeedbackEntry(value: unknown): value is MethodologyRemediationFeedbackEntry {
  return typeof value === 'object'
    && value !== null
    && 'status' in value
    && 'updatedAt' in value
    && isFeedbackStatus(value.status)
    && typeof value.updatedAt === 'number'
    && Number.isFinite(value.updatedAt);
}

export function loadMethodologyRemediationFeedbackMap(): Record<string, MethodologyRemediationFeedbackEntry> {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed == null || Array.isArray(parsed)) return {};

    const result: Record<string, MethodologyRemediationFeedbackEntry> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (isFeedbackEntry(value)) result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

export function setMethodologyRemediationFeedback(
  feedbackKey: string,
  status: MethodologyRemediationFeedbackStatus,
  updatedAt: number = Date.now(),
): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    const next = {
      ...loadMethodologyRemediationFeedbackMap(),
      [feedbackKey]: { status, updatedAt },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function clearMethodologyRemediationFeedback(feedbackKey: string): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    const next = loadMethodologyRemediationFeedbackMap();
    delete next[feedbackKey];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}
