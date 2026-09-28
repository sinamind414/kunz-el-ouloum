// SchemaDrillView.test.tsx — verrous d'interaction de « ارسم من الذاكرة »
// (audit item 17, sprint 12).
//
// LE verrou de ce module : l'image officielle ne doit exister dans le DOM
// à AUCUN moment avant que l'élève ait dessiné puis coché sa grille. Si
// l'image fuit en phase 1, l'exercice n'est plus un exercice de mémoire.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import SchemaDrillView from '../SchemaDrillView';
import { SCHEMA_DRILLS } from '../../data/schemaDrills';
import { bacEchoForDrill } from '../../data/bacSessionIndex';
import { SCHEMA_DRILLS, SCHEMA_DRILL_BY_ID, totalPoints } from '../../data/schemaDrills';

afterEach(cleanup);

describe('SchemaDrillView — liste', () => {
  it('liste tous les schémas à mémoriser', () => {
    render(<SchemaDrillView />);
    expect(screen.getByTestId('drill-count').textContent).toContain(String(SCHEMA_DRILLS.length));
    expect(screen.getByTestId('drill-drill_synapse')).toBeTruthy();
  });

  it('le filtre par unité réduit la liste et se désactive au second clic', async () => {
    const user = userEvent.setup();
    render(<SchemaDrillView />);
    await user.click(screen.getByTestId('drill-unite-5'));
    const attendus = SCHEMA_DRILLS.filter((d) => d.unitId === 5).length;
    expect(screen.getByTestId('drill-count').textContent).toContain(String(attendus));
    await user.click(screen.getByTestId('drill-unite-5'));
    expect(screen.getByTestId('drill-count').textContent).toContain(String(SCHEMA_DRILLS.length));
  });

  it('aucune image de schéma n est rendue dans la liste', () => {
    const { container } = render(<SchemaDrillView />);
    expect(container.querySelectorAll('img')).toHaveLength(0);
  });
});

describe('SchemaDrillView — phase 1 : la feuille blanche', () => {
  it('ouvre la consigne et l ordre de tracé, sans jamais montrer l image', async () => {
    const user = userEvent.setup();
    const { container } = render(<SchemaDrillView />);
    await user.click(screen.getByTestId('drill-drill_synapse'));

    expect(screen.getByTestId('phase-dessin')).toBeTruthy();
    expect(screen.getByTestId('drill-consigne').textContent).toContain('ارسم');
    expect(screen.getByTestId('drill-ordre').children.length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByTestId('drill-asset')).toBeNull();
    expect(container.querySelectorAll('img')).toHaveLength(0);
  });

  it('la grille d auto-évaluation n est pas non plus visible en phase 1', async () => {
    const user = userEvent.setup();
    render(<SchemaDrillView />);
    await user.click(screen.getByTestId('drill-drill_synapse'));
    expect(screen.queryByTestId('element-vesicules')).toBeNull();
  });
});

describe('SchemaDrillView — phase 2 : auto-évaluation', () => {
  it('affiche tous les éléments cotés du schéma, image toujours cachée', async () => {
    const user = userEvent.setup();
    render(<SchemaDrillView />);
    await user.click(screen.getByTestId('drill-drill_synapse'));
    await user.click(screen.getByTestId('drill-fini'));

    for (const el of SCHEMA_DRILL_BY_ID.drill_synapse.elements) {
      expect(screen.getByTestId(`element-${el.id}`), el.id).toBeTruthy();
    }
    expect(screen.queryByTestId('drill-asset')).toBeNull();
  });

  it('cocher puis décocher un élément est réversible', async () => {
    const user = userEvent.setup();
    render(<SchemaDrillView />);
    await user.click(screen.getByTestId('drill-drill_synapse'));
    await user.click(screen.getByTestId('drill-fini'));

    const bouton = screen.getByTestId('element-fente');
    expect(bouton.getAttribute('aria-pressed')).toBe('false');
    await user.click(bouton);
    expect(screen.getByTestId('element-fente').getAttribute('aria-pressed')).toBe('true');
    await user.click(screen.getByTestId('element-fente'));
    expect(screen.getByTestId('element-fente').getAttribute('aria-pressed')).toBe('false');
  });
});

describe('SchemaDrillView — phase 3 : comparaison', () => {
  it('une feuille blanche donne 0 et le verdict le plus sévère', async () => {
    const user = userEvent.setup();
    render(<SchemaDrillView />);
    await user.click(screen.getByTestId('drill-drill_synapse'));
    await user.click(screen.getByTestId('drill-fini'));
    await user.click(screen.getByTestId('drill-valider'));

    const total = totalPoints(SCHEMA_DRILL_BY_ID.drill_synapse);
    expect(screen.getByTestId('drill-score').textContent).toContain(`0 / ${total}`);
    expect(screen.getByTestId('drill-verdict').textContent).toContain('إعادة');
  });

  it('l image officielle n apparaît qu ici, avec son texte alternatif', async () => {
    const user = userEvent.setup();
    render(<SchemaDrillView />);
    await user.click(screen.getByTestId('drill-drill_synapse'));
    await user.click(screen.getByTestId('drill-fini'));
    await user.click(screen.getByTestId('drill-valider'));

    const img = screen.getByTestId('drill-asset') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe(SCHEMA_DRILL_BY_ID.drill_synapse.assetSrc);
    expect(img.getAttribute('alt')).toBe(SCHEMA_DRILL_BY_ID.drill_synapse.altAr);
  });

  it('les éléments essentiels oubliés sont listés nommément', async () => {
    const user = userEvent.setup();
    render(<SchemaDrillView />);
    await user.click(screen.getByTestId('drill-drill_synapse'));
    await user.click(screen.getByTestId('drill-fini'));
    for (const el of SCHEMA_DRILL_BY_ID.drill_synapse.elements) {
      if (el.id !== 'vesicules') await user.click(screen.getByTestId(`element-${el.id}`));
    }
    await user.click(screen.getByTestId('drill-valider'));

    const oublis = screen.getByTestId('drill-oublis').textContent ?? '';
    expect(oublis).toContain('الحويصلات');
  });

  it('tout cocher donne le total, le verdict « مُتقَن » et aucune liste d oublis', async () => {
    const user = userEvent.setup();
    render(<SchemaDrillView />);
    await user.click(screen.getByTestId('drill-drill_synapse'));
    await user.click(screen.getByTestId('drill-fini'));
    for (const el of SCHEMA_DRILL_BY_ID.drill_synapse.elements) {
      await user.click(screen.getByTestId(`element-${el.id}`));
    }
    await user.click(screen.getByTestId('drill-valider'));

    const total = totalPoints(SCHEMA_DRILL_BY_ID.drill_synapse);
    expect(screen.getByTestId('drill-score').textContent).toContain(`${total} / ${total}`);
    expect(screen.getByTestId('drill-verdict').textContent).toContain('مُتقَن');
    expect(screen.queryByTestId('drill-oublis')).toBeNull();
  });

  it('« أعد الرسم » ramène à la feuille blanche et remet le score à zéro', async () => {
    const user = userEvent.setup();
    render(<SchemaDrillView />);
    await user.click(screen.getByTestId('drill-drill_synapse'));
    await user.click(screen.getByTestId('drill-fini'));
    await user.click(screen.getByTestId('element-fente'));
    await user.click(screen.getByTestId('drill-valider'));
    await user.click(screen.getByTestId('drill-recommencer'));

    expect(screen.getByTestId('phase-dessin')).toBeTruthy();
    expect(screen.queryByTestId('drill-asset')).toBeNull();

    await user.click(screen.getByTestId('drill-fini'));
    expect(screen.getByTestId('element-fente').getAttribute('aria-pressed')).toBe('false');
  });
});

describe('schéma — écho BAC (sprint 35)', () => {
  it('annonce les sessions où le schéma a été demandé', async () => {
    const user = userEvent.setup();
    const avecEcho = SCHEMA_DRILLS.find((d) => bacEchoForDrill(d.id).years.length > 0)!;
    render(<SchemaDrillView />);
    await user.click(screen.getByTestId(`drill-${avecEcho.id}`));
    const badge = screen.getByTestId('drill-echo-bac');
    expect(badge.textContent).toContain('مطلوب في البكالوريا');
    for (const annee of bacEchoForDrill(avecEcho.id).years) {
      expect(badge.textContent).toContain(String(annee));
    }
  });
});
