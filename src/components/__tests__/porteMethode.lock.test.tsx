// porteMethode.lock.test.tsx — accès progressif à مفتاح المنهجية.
// Le premier écran ouvre le noyau Meftah ; le simulateur est voisin et les
// références/outils de suivi restent disponibles dans un volet secondaire.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import MethodologyCompilerView from '../MethodologyCompilerView';

afterEach(cleanup);

const CHEMIN = join(process.cwd(), 'src', 'components', 'MethodologyCompilerView.tsx');
const SOURCE = readFileSync(CHEMIN, 'utf8');

describe('entrée de la méthodologie', () => {
  it("l'atelier المفتاح est l'écran d'arrivée (rendu réel)", () => {
    render(<MethodologyCompilerView />);
    expect(screen.getByRole('heading', { name: 'المفتاح' })).toBeTruthy();
  });

  it("le simulateur des 4 étapes n'est pas l'écran d'arrivée", () => {
    render(<MethodologyCompilerView />);
    expect(screen.queryByText('Complétion')).toBeNull();
  });

  it("le défaut est figé en source : useState<AtelierId>('meftah')", () => {
    expect(SOURCE).toContain("useState<AtelierId>('meftah')");
  });

  it('met en avant le parcours et replie les références sans les supprimer', () => {
    render(<MethodologyCompilerView />);
    const references = screen.getByTestId('methodology-more-tools') as HTMLDetailsElement;
    expect(references.open).toBe(false);
    expect(screen.getByTestId('methodology-atelier-meftah')).toBeTruthy();
    expect(screen.getByTestId('methodology-atelier-simulator')).toBeTruthy();
    expect(screen.getByTestId('methodology-atelier-verbs_ref').closest('details')).toBe(references);

    fireEvent.click(screen.getByTestId('methodology-more-tools-summary'));
    expect(references.open).toBe(true);
    expect(screen.getByTestId('methodology-print-card').closest('details')).toBe(references);
  });

  it('la fiche imprimable porte un nom distinct de la page', () => {
    expect(SOURCE).toContain('بطاقة المفتاح — للطباعة');
    expect(SOURCE).not.toContain('} — للطباعة');
  });
});
