// src/components/__tests__/Icone.test.tsx — verrou du point unique de résolution
// clé d'icône → composant lucide (src/components/Icone.tsx).
//
// Enjeu : une clé licite sans composant ferait planter le rendu (composant
// indéfini). Le Record est typé exhaustivement (tsc) ET vérifié ici (runtime).
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Icone, { ICONES } from '../Icone';
import { ICONES_AUTORISEES } from '../../data/lessonIcons';

afterEach(cleanup);

describe('Icone — résolution clé → composant', () => {
  it('le Record couvre exactement les clés licites (aucune clé orpheline)', () => {
    expect(Object.keys(ICONES).sort()).toEqual([...ICONES_AUTORISEES].sort());
  });

  it('chaque clé licite rend un <svg> avec la classe transmise', () => {
    for (const cle of ICONES_AUTORISEES) {
      const { container, unmount } = render(<Icone cle={cle} className="w-4 h-4 test-icone" />);
      const svg = container.querySelector('svg');
      expect(svg, `clé ${cle} sans composant`).toBeTruthy();
      expect(svg!.getAttribute('class')).toContain('test-icone');
      unmount();
    }
  });
});
