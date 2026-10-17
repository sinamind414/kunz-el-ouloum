// BackupPanel.test.tsx — sauvegarde et restauration côté élève (sprint 46).

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BackupPanel from '../BackupPanel';
import { BACKUP_SCHEMA, serialiserBackup } from '../../data/backup';

afterEach(cleanup);
beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

const fichier = (contenu: string, nom = 'sauvegarde.json') =>
  new File([contenu], nom, { type: 'application/json' });

describe('panneau de sauvegarde', () => {
  it('annonce combien d’éléments seraient emportés', () => {
    localStorage.setItem('svt_progress', '{"xp":50}');
    localStorage.setItem('kunz.examSession', '{"numero":2}');
    render(<BackupPanel />);
    expect(screen.getByTestId('backup-resume').textContent).toContain('2');
  });

  it('déclenche un téléchargement nommé par la date', async () => {
    const user = userEvent.setup();
    const clic = vi.fn();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const creerElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = creerElement(tag) as HTMLElement;
      if (tag === 'a') (el as HTMLAnchorElement).click = clic;
      return el;
    });

    localStorage.setItem('svt_progress', '{"xp":50}');
    render(<BackupPanel />);
    await user.click(screen.getByTestId('backup-exporter'));
    expect(clic).toHaveBeenCalled();
    expect(screen.getByTestId('backup-message').textContent).toContain('النسخة الاحتياطية');
  });

  it('restaure une sauvegarde valide et le dit', async () => {
    const user = userEvent.setup();
    localStorage.setItem('svt_progress', '{"xp":999}');
    const json = serialiserBackup();
    localStorage.clear();

    render(<BackupPanel />);
    await user.upload(screen.getByTestId('backup-fichier'), fichier(json));
    await waitFor(() =>
      expect(screen.getByTestId('backup-message').textContent).toContain('استعادة'),
    );
    expect(localStorage.getItem('svt_progress')).toBe('{"xp":999}');
  });

  it('refuse un fichier étranger sans rien écraser', async () => {
    const user = userEvent.setup();
    localStorage.setItem('svt_progress', '{"xp":7}');
    render(<BackupPanel />);
    await user.upload(screen.getByTestId('backup-fichier'), fichier('{"schema":"autre"}'));
    await waitFor(() =>
      expect(screen.getByTestId('backup-message').textContent).toContain('ليس نسخة احتياطية'),
    );
    expect(localStorage.getItem('svt_progress')).toBe('{"xp":7}');
  });

  it('signale les clés ignorées au lieu de les taire', async () => {
    const user = userEvent.setup();
    render(<BackupPanel />);
    const json = JSON.stringify({
      schema: BACKUP_SCHEMA,
      donnees: { svt_progress: '{"xp":1}', boussole_token: 'vole' },
    });
    await user.upload(screen.getByTestId('backup-fichier'), fichier(json));
    await waitFor(() => expect(screen.getByTestId('backup-message').textContent).toContain('تجاهل'));
    expect(localStorage.getItem('boussole_token')).toBeNull();
  });
});
