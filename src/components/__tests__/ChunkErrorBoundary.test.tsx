// ChunkErrorBoundary.test.tsx — filet des vues à la demande (sprint 33).

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ChunkErrorBoundary, { estEchecDeChargement } from '../ChunkErrorBoundary';

afterEach(cleanup);

function Casse({ message }: { message: string }): never {
  throw new Error(message);
}

/** React journalise l'erreur capturée : on tait le bruit pendant ces tests. */
function sansBruit(fn: () => void) {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    fn();
  } finally {
    spy.mockRestore();
  }
}

describe('reconnaissance de l’échec de chargement', () => {
  it('reconnaît les formulations des navigateurs', () => {
    for (const m of [
      'Failed to fetch dynamically imported module: /assets/StatsView-abc.js',
      'error loading dynamically imported module',
      'Importing a module script failed.',
      'ChunkLoadError: Loading chunk 42 failed',
    ]) {
      expect(estEchecDeChargement(new Error(m)), m).toBe(true);
    }
  });

  it('ne confond pas une erreur applicative avec une coupure réseau', () => {
    expect(estEchecDeChargement(new Error('Cannot read properties of undefined'))).toBe(false);
  });
});

describe('frontière d’erreur', () => {
  it('laisse passer le contenu quand tout va bien', () => {
    render(
      <ChunkErrorBoundary>
        <p>محتوى</p>
      </ChunkErrorBoundary>,
    );
    expect(screen.getByText('محتوى')).toBeTruthy();
  });

  it('explique la coupure réseau au lieu d’un écran blanc', () => {
    sansBruit(() =>
      render(
        <ChunkErrorBoundary>
          <Casse message="Failed to fetch dynamically imported module: /assets/BacIdeasView-x.js" />
        </ChunkErrorBoundary>,
      ),
    );
    const bloc = screen.getByTestId('chunk-erreur-reseau');
    expect(bloc.textContent).toContain('تعذّر تحميل هذا القسم');
    expect(bloc.textContent).toContain('دون اتصال');
  });

  it('affiche le message réel des autres erreurs, sans les masquer', () => {
    sansBruit(() =>
      render(
        <ChunkErrorBoundary>
          <Casse message="مشكل داخلي دقيق" />
        </ChunkErrorBoundary>,
      ),
    );
    expect(screen.getByTestId('chunk-erreur-autre').textContent).toContain('مشكل داخلي دقيق');
  });

  it('remonte l’erreur à l’appelant', () => {
    const onError = vi.fn();
    sansBruit(() =>
      render(
        <ChunkErrorBoundary onError={onError}>
          <Casse message="Failed to fetch dynamically imported module" />
        </ChunkErrorBoundary>,
      ),
    );
    expect(onError).toHaveBeenCalled();
  });

  it('réessaie sans recharger la page', async () => {
    const user = userEvent.setup();
    let doitCasser = true;
    function Instable() {
      if (doitCasser) throw new Error('Failed to fetch dynamically imported module');
      return <p>تم التحميل</p>;
    }
    sansBruit(() =>
      render(
        <ChunkErrorBoundary>
          <Instable />
        </ChunkErrorBoundary>,
      ),
    );
    doitCasser = false;
    await user.click(screen.getByTestId('chunk-reessayer'));
    expect(screen.getByText('تم التحميل')).toBeTruthy();
  });
});
