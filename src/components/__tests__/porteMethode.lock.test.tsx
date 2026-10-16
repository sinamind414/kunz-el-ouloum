// porteMethode.lock.test.tsx — verrou Phase 1 « مفتاح المنهجية » (2026-10-16,
// GO utilisateur : App.tsx et MethodologyCompilerView autorisés sur ce périmètre).
//
// Défaut constaté (plainte expert pédagogue) : « مفتاح المنهجية v6.0 » portait
// 5 objets distincts — la carte du hub التمارين, le TITRE de la page, un
// atelier de la grille, la fiche imprimable (MiftahCard) et les 3 visages
// données (المفتاح/المفتاح+/المفتاح++). L'élève qui clique la carte tombe sur
// une grille d'ateliers aux noms techniques ; la fiche v6.0 n'est jamais en
// face de lui.
//
// Verrous :
//  1. La page s'ouvre sur l'atelier المفتاح (MeftahView) par défaut —
//     comportemental (rendu réel), pas un simple toContain.
//  2. Le simulateur (الخطوات الأربع) n'est plus l'écran d'arrivée.
//  3. La fiche imprimable a un nom DISTINCT de la page : « بطاقة المفتاح ».

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import MethodologyCompilerView from '../MethodologyCompilerView';

afterEach(cleanup);

const CHEMIN = join(process.cwd(), 'src', 'components', 'MethodologyCompilerView.tsx');
const SOURCE = readFileSync(CHEMIN, 'utf8');

describe('Phase 1 — la porte « مفتاح المنهجية » ouvre le المفتاح', () => {
  it("l'atelier المفتاح est l'écran d'arrivée (rendu réel, pas un toContain)", () => {
    render(<MethodologyCompilerView />);
    // MeftahView (l'atelier المفتاح) porte l'unique <h1>المفتاح</h1> — la grille
    // d'ateliers, elle, propose « مفتاح المنهجية + BAC 2025 » (texte différent).
    expect(screen.getByRole('heading', { name: 'المفتاح' })).toBeTruthy();
  });

  it("le simulateur des 4 étapes n'est plus l'écran d'arrivée", () => {
    render(<MethodologyCompilerView />);
    // Les pastilles « Complétion » de l'atelier الخطوات الأربع ne doivent PAS
    // être rendues au premier écran (elles le deviennent après un clic).
    expect(screen.queryByText('Complétion')).toBeNull();
  });

  it("le défaut est figé en source : useState<AtelierId>('meftah')", () => {
    expect(SOURCE).toContain("useState<AtelierId>('meftah')");
  });

  it('la fiche imprimable porte un nom DISTINCT : بطاقة المفتاح — للطباعة', () => {
    expect(SOURCE).toContain('بطاقة المفتاح — للطباعة');
    expect(SOURCE).not.toContain('} — للطباعة'); // ancien libellé « المفتاح — للطباعة »
  });
});
