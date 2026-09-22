// ============================================================
// StudentAccountBar.session.test.tsx — verrous de session (fix audit) :
//   · 401 du serveur → jeton effacé + onLogout appelé
//   · panne réseau   → jeton CONSERVÉ (app offline-first)
//   · logout manuel  → onLogout appelé
// NB : ni jest-dom ni globals vitest → cleanup manuel + assertions natives.
// ============================================================
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import StudentAccountBar from '../StudentAccountBar';

afterEach(() => {
  cleanup(); // RTL n'auto-nettoie pas sans vitest.globals
  vi.unstubAllGlobals();
  localStorage.clear();
  vi.restoreAllMocks();
});

function renderBar(onLogout = vi.fn()) {
  const utils = render(<StudentAccountBar onOpenTeacher={vi.fn()} onLogout={onLogout} />);
  return { ...utils, onLogout };
}

describe('StudentAccountBar — session', () => {
  it('401 → efface le jeton et prévient App (onLogout)', async () => {
    localStorage.setItem('boussole_token', 'jwt-perime');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ error: 'invalid_token' }) }),
    );
    const { onLogout } = renderBar();
    await waitFor(() => expect(onLogout).toHaveBeenCalledTimes(1));
    expect(localStorage.getItem('boussole_token')).toBeNull();
  });

  it('panne réseau → garde le jeton, n’appelle PAS onLogout', async () => {
    localStorage.setItem('boussole_token', 'jwt-valide');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const { onLogout } = renderBar();
    // Laisser l'effet se terminer.
    await new Promise((r) => setTimeout(r, 50));
    expect(onLogout).not.toHaveBeenCalled();
    expect(localStorage.getItem('boussole_token')).toBe('jwt-valide');
  });

  it('200 → affiche le nom de l’élève (session restaurée)', async () => {
    localStorage.setItem('boussole_token', 'jwt-valide');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ student: { id: 's1', email: 'a@b.c', name: 'أمين' } }),
      }),
    );
    renderBar();
    // getByText lève si absent — assertion implicite + waitFor anti-course.
    await waitFor(() => expect(screen.getByText('أمين')).toBeTruthy());
  });

  it('déconnexion manuelle → onLogout appelé + jeton effacé', async () => {
    localStorage.setItem('boussole_token', 'jwt-valide');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ student: { id: 's1', email: 'a@b.c', name: 'خديجة' } }),
      }),
    );
    const { onLogout, container } = renderBar();
    await waitFor(() => expect(screen.getByText('خديجة')).toBeTruthy());
    // Ouvre le menu puis clique sur « تسجيل الخروج » (déconnexion).
    fireEvent.click(container.querySelector('button')!);
    const logoutBtn = await screen.findByText('تسجيل الخروج');
    fireEvent.click(logoutBtn);
    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('boussole_token')).toBeNull();
  });
});
