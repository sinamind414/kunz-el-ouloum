// MoiView.test.tsx — page « أنا » (photo 1 du design OPUS 5.5).
//
// Convention repo : pas de @testing-library/jest-dom → .toBeTruthy() /
// .toBeNull() / .toHaveLength(). cleanup() explicite. localStorage nettoyé
// entre les tests (l'état du parcours persiste sinon).
//
// Ce qui est vérifié :
//   - en-tête : eyebrow « أنا », nom de session ou mention « مسار تجريبي »
//     (aucun code de suivi fabriqué) ;
//   - شجرتك : 3 domaines, 11 unités, une feuille PAR LEÇON (59) + 11 points
//     de جسار, et la légende 4 entrées ;
//   - feuille verte après مسارات fait, feuille or après échec, pâle sinon ;
//   - أرقامك بالكلếmات reflète le store (0 / 59 au départ) ;
//   - المزيد : les deux rubriques déplacées du menu latéral (2026-10-03)
//     finissent en DERNIER bloc, une icône chacune, et un test relit App.tsx
//     pour prouver qu'elles ont bien été RETIRÉES (menu latéral pour les deux
//     premières, barre principale pour تقدمي) — déplacement, jamais doublon.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MoiView from '../MoiView';
import { MOI_RACCOURCI_COUNT, MOI_RACCOURCIS, type MoiRaccourciTab } from '../../data/moiRaccourcis';
import { PARCOURS_DOMAINS, PARCOURS_FLAT } from '../../lib/parcours/parcoursPath';
import { markDone } from '../../lib/parcours/parcoursProgress';

const STORAGE_KEY = 'kunz_parcours_v1';

const NB_LECONS = PARCOURS_FLAT.filter((i) => i.kind === 'lesson').length;
const NB_JALONS = PARCOURS_FLAT.filter((i) => i.kind === 'jalon').length;

function rendre(nomEleve: string | null = null, courriel: string | null = null) {
  return render(<MoiView nomEleve={nomEleve} courriel={courriel} />);
}

/** Variante câblée : c'est dans cet état que App.tsx monte la page. */
function rendreAvecRaccourcis(onOuvrir: (onglet: MoiRaccourciTab) => void = vi.fn()) {
  return render(<MoiView nomEleve={null} courriel={null} onOuvrir={onOuvrir} />);
}

/** Feuilles lucide : <svg aria-label="titre du leçon"> — arbre SEUL (la
 *  légende porte aussi des feuilles et fausserait le décompte). */
function feuilles(container: HTMLElement): Element[] {
  const bloc = container.querySelector('[data-testid="moi-tree-units"]');
  if (!bloc) return [];
  return Array.from(bloc.querySelectorAll('svg[aria-label]'));
}

describe('MoiView — en-tête identité', () => {
  it('affiche le nom de session et le courriel sans code de suivi inventé', () => {
    const { container } = rendre('أمينة', 'ammina@example.dz');
    expect(screen.getByTestId('moi-header')).toBeTruthy();
    expect(screen.getByText('أنا')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'أمينة' })).toBeTruthy();
    expect(screen.getByText(/ammina@example\.dz/)).toBeTruthy();
    // Aucun « رمز المتابعة » fabriqué : le zip s'appuie sur un id learner
    // que l'app ne possède pas.
    expect(screen.queryByText(/رمز المتابعة/)).toBeNull();
    expect(container).toBeTruthy();
  });

  it('hors session, annonce un parcours local (pas de nom, pas de faux identifiant)', () => {
    rendre();
    expect(screen.getByRole('heading', { name: 'صفحتي' })).toBeTruthy();
    expect(screen.getByText('مسار تجريبي · محفوظ على هذا الجهاز')).toBeTruthy();
  });
});

describe('MoiView — شجرتك (arbre)', () => {
  it('rend les 3 domaines, les 11 unités et une feuille par leçon', () => {
    const { container } = rendre();
    expect(screen.getByTestId('moi-tree')).toBeTruthy();

    PARCOURS_DOMAINS.forEach((d) => {
      expect(screen.getAllByText(d.title).length).toBeGreaterThan(0);
    });
    // 11 lignes d'unité (une <li> par unité) — bloqu dans le bloc unités,
    // la légende possède aussi des <li>.
    const lignes = screen.getByTestId('moi-tree-units').querySelectorAll('li');
    expect(lignes).toHaveLength(PARCOURS_DOMAINS.reduce((n, d) => n + d.units.length, 0));

    // Une feuille PAR LEÇON (les جسار sont des points, pas des feuilles).
    expect(feuilles(container)).toHaveLength(NB_LECONS);
    expect(NB_LECONS + NB_JALONS).toBe(70);
  });

  it('colore la feuille selon l état : pâle → verte (fait) → or (fragile)', () => {
    const { container } = rendre();
    const premiere = PARCOURS_FLAT.find((i) => i.kind === 'lesson');
    expect(premiere).toBeTruthy();

    // 1. Non faite → simple contour pâle, jamais de remplissage.
    let feuille = feuilles(container).find(
      (svg) => svg.getAttribute('aria-label') === premiere!.title,
    );
    // `className` d'un <svg> est un SVGAnimatedString (objet) → on lit
    // l'attribut class, qui est une chaîne.
    expect(feuille).toBeTruthy();
    expect(feuille!.getAttribute('class')).toContain('text-[#e2dabf]');
    expect(feuille!.getAttribute('class')).not.toContain('fill-[');

    // 2. Faite → remplissage forêt.
    markDone(premiere!.id, 1);
    cleanup();
    const deuxieme = rendre();
    feuille = feuilles(deuxieme.container).find(
      (svg) => svg.getAttribute('aria-label') === premiere!.title,
    );
    expect(feuille!.getAttribute('class')).toContain('fill-[#006d37]');

    // 3. Fragile (note < seuil) → remplissage or.
    markDone(premiere!.id, 0.2);
    cleanup();
    const troisieme = rendre();
    const encore = feuilles(troisieme.container).find(
      (svg) => svg.getAttribute('aria-label') === premiere!.title,
    );
    expect(encore!.getAttribute('class')).toContain('fill-[#f3dfae]');
  });

  it('dessine le point du جسار : vide par défaut, plein une fois ouvert', () => {
    const { container } = rendre();
    const point = container.querySelector('[aria-label="الجسر"]');
    expect(point).toBeTruthy();
    expect(point!.className).toContain('border border-[#e2dabf]');

    markDone(PARCOURS_FLAT.find((i) => i.kind === 'jalon')!.id, 1);
    cleanup();
    const suivant = rendre();
    const pointOuvert = suivant.container.querySelector('[aria-label="الجسر"]');
    expect(pointOuvert!.className).toContain('bg-[#00562b]');
  });

  it('expose une légende de 4 entrées (lire l arbre sans deviner)', () => {
    rendre();
    expect(screen.getByText('مُنجز')).toBeTruthy();
    expect(screen.getByText('هشّ — يعود في المراجعة')).toBeTruthy();
    expect(screen.getByText('لم يُنجز بعد')).toBeTruthy();
    expect(screen.getByText('جسر مفتوح')).toBeTruthy();
  });
});

describe('MoiView — أرقامك بالكلمات', () => {
  it('reflète le store : 0 leçon faite au démarrage, puis 1', () => {
    rendre();
    expect(screen.getByTestId('moi-nums')).toBeTruthy();
    expect(screen.getByText('دروس مُنجزة')).toBeTruthy();
    expect(screen.getByText(`0 / ${NB_LECONS}`)).toBeTruthy();

    cleanup();
    markDone(PARCOURS_FLAT[0].id, 1);
    const { container } = rendre();
    expect(container.textContent).toContain(`1 / ${NB_LECONS}`);
  });
});

describe('MoiView — المزيد : rubriques déplacées du menu latéral', () => {
  // Décision 2026-10-03 : « الأوسمة والإنجازات » et « لوحة المتابعة » quittent
  // le menu « المزيد » de App.tsx pour finir SOUS l'avancement, en icônes.

  it('se place en DERNIER bloc, donc bien sous l avancement', () => {
    const { container } = rendreAvecRaccourcis();
    const blocs = [...container.querySelectorAll('section[data-testid]')].map((s) =>
      s.getAttribute('data-testid'),
    );
    expect(blocs).toEqual(['moi-tree', 'moi-nums', 'moi-raccourcis']);
  });

  it('affiche exactement une icône par rubrique déplacée, avec son libellé', () => {
    rendreAvecRaccourcis();
    expect(screen.getByTestId('moi-raccourcis')).toBeTruthy();
    for (const r of MOI_RACCOURCIS) {
      const bouton = screen.getByTestId(`moi-raccourci-${r.tab}`);
      expect(bouton.textContent, r.tab).toContain(r.labelAr);
      // Bouton = icône (svg) + étiquette, jamais un simple texte.
      expect(bouton.querySelector('svg'), r.tab).toBeTruthy();
      expect(bouton.getAttribute('aria-label')).toBe(r.labelAr);
      // Libellé arabe : aucune lettre latine importée du libellé FR.
      expect(/[A-Za-z]/.test(r.labelAr), r.tab).toBe(false);
    }
    expect(screen.getAllByTestId(/^moi-raccourci-/)).toHaveLength(MOI_RACCOURCI_COUNT);
  });

  it('ordonne les icônes : تقدمي d abord, puis الأوسمة, لوحة المتابعة en dernier', () => {
    rendreAvecRaccourcis();
    // L'ordre du DOM doit être EXACTEMENT l'ordre de la donnée source.
    const rangs = screen.getAllByTestId(/^moi-raccourci-/).map((b) => b.getAttribute('data-testid'));
    expect(rangs).toEqual(['moi-raccourci-stats', 'moi-raccourci-badges', 'moi-raccourci-teacher']);
    expect(MOI_RACCOURCIS.map((r) => r.tab)).toEqual(['stats', 'badges', 'teacher']);
    // …et l'ordre RTL se lit de la droite : تقدمي en tête de ligne.
    const rangs2 = screen.getAllByTestId(/^moi-raccourci-/).map((b) => b.textContent);
    expect(rangs2[0]).toContain('تقدمي');
    expect(rangs2[rangs2.length - 1]).toContain('لوحة المتابعة');
  });

  it('un clic ouvre le détail de CETTE rubrique (pas une autre)', () => {
    const onOuvrir = vi.fn();
    rendreAvecRaccourcis(onOuvrir);
    for (const r of MOI_RACCOURCIS) {
      onOuvrir.mockClear();
      fireEvent.click(screen.getByTestId(`moi-raccourci-${r.tab}`));
      expect(onOuvrir, r.tab).toHaveBeenCalledTimes(1);
      expect(onOuvrir, r.tab).toHaveBeenCalledWith(r.tab);
    }
  });

  it('sans callback, le bloc n est PAS rendu : aucun bouton inerte', () => {
    const { container } = rendre();
    expect(screen.queryByTestId('moi-raccourcis')).toBeNull();
    expect(container.querySelector('[data-testid^="moi-raccourci-"]')).toBeNull();
  });

  it('a bien RETIRÉ les rubriques de leurs anciens menus (déplacement, pas doublon)', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const src = readFileSync(resolve(__dirname, '../../App.tsx'), 'utf8');

    const lire = (nom: string): string => {
      const i = src.indexOf(`const ${nom}`);
      expect(i, `${nom} introuvable dans App.tsx`).toBeGreaterThan(0);
      const suite = src.slice(i, i + 2400);
      return suite.slice(0, suite.indexOf('];'));
    };
    const menuSecondaire = lire('SECONDARY_NAV');
    const menuPrincipal = lire('PRIMARY_NAV');

    // 1. Menu latéral « المزيد » : les deux premières rubriques sont parties.
    const entreesSecondaires = (menuSecondaire.match(/\{ tab: '/g) ?? []).length;
    expect(entreesSecondaires).toBeGreaterThan(0);
    expect(entreesSecondaires).toBeLessThanOrEqual(6);
    for (const tab of ['badges', 'teacher']) {
      expect(menuSecondaire, `${tab} est toujours dans le menu latéral`).not.toContain(
        `tab: '${tab}'`,
      );
    }
    // …et leurs icônes n'y sont plus référencées.
    expect(src).not.toMatch(/Icon: Award/);
    expect(src).not.toMatch(/Icon: LayoutDashboard/);

    // 2. Barre principale : تقدمي est partie, « أنا » ferme la barre, et
    //    « مسار تعلمك » a quitté la barre le 2026-10-03 (rubrique supprimée,
    //    principe conservé : compteur + leçon suggérée dans « الدرس الرسمي »).
    const entreesPrincipales = (menuPrincipal.match(/\{ tab: '/g) ?? []).length;
    expect(entreesPrincipales).toBe(6);
    expect(menuPrincipal, 'تقدمي est toujours dans la barre principale').not.toContain(
      "tab: 'stats'",
    );
    expect(menuPrincipal, 'المسار est toujours dans la barre principale').not.toContain(
      "tab: 'parcours'",
    );
    expect(src, 'ParcoursView est toujours monté').not.toContain('<ParcoursView');
    const onglets = [...menuPrincipal.matchAll(/\{ tab: '([a-z]+)'/g)].map((m) => m[1]);
    expect(onglets[onglets.length - 1]).toBe('moi');

    // 3. Aucune des trois rubriques n'a survécu dans un ancien menu.
    expect(MOI_RACCOURCI_COUNT).toBe(3);
    for (const r of MOI_RACCOURCIS) {
      expect(menuSecondaire, `${r.tab} (latéral)`).not.toContain(`tab: '${r.tab}'`);
      expect(menuPrincipal, `${r.tab} (barre)`).not.toContain(`tab: '${r.tab}'`);
    }
  });
});

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  localStorage.removeItem(STORAGE_KEY);
});
