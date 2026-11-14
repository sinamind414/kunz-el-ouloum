// cleVivante.lock.test.tsx — verrou « المفتاح الحيّ » (2026-11-13, GO propriétaire)
// Scénario élève : « quand tu cliques sur la dent, le verbe réagit » (design audité).
//
// Verrous :
//   1. La clé SVG à 4 dents réagit : une dent allumée grandit et change de couleur.
//   2. Clic dent → les verbes qui utilisent cette dent réagissent (s'allument), les autres s'estompent.
//   3. Clic / survol verbe → les dents de ce verbe s'allument ; les dents non utilisées restent éteintes.
//   4. Source-scan : les libellés des dents proviennent d'ASNAN (miftahSpec), aucun littéral dupliqué.
//   5. Couverture : les 12 verbes de VERBES_CLE ont tous un mapping de dents valide.
//   6. « La dent brille » (demande owner 2026-11-13) : au clic sur le mot, la dent
//      porte le halo (data-halo) + la lueur (filter url(#cle-lueur…)) via data-brille ;
//      aucune dent ne brille au repos ; clic direct sur la dent de la clé = clic sur le mot.
//   7. Légende ✕ honnête : le ✕ (لا يحتاجها) est sur les verbes ÉCARTÉS (barrés,
//      data-ecarte), jamais sur les verbes qui utilisent la dent.
//
// NB : @testing-library/jest-dom n'est PAS câblé (AGENTS.md) → .toBeTruthy() / .toBeNull().
// Class du bouton actif dent : 'border-[#c08a1f]' ; class du verbe « utilisé » : 'border-[#0e6b6b]'.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CleVivante } from '../CleVivante';
import { DENTS, VERBES_CLE, VERBES_CLE_ID } from '../../data/cleVivante';
import { ASNAN } from '../../data/miftahSpec';

const CHEMIN = join(process.cwd(), 'src', 'components', 'CleVivante.tsx');
const SOURCE = readFileSync(CHEMIN, 'utf8');

afterEach(cleanup);

function dentPills(): HTMLButtonElement[] {
  const group = screen.getAllByRole('group', { name: /الأسنان الأربعة/i })[0];
  return Array.from(group.querySelectorAll('button'));
}

function verbeButtons(): HTMLButtonElement[] {
  const group = screen.getAllByRole('group', { name: /قائمة الأفعال/i })[0];
  return Array.from(group.querySelectorAll('button'));
}

describe('cleVivante — structure et données', () => {
  it('affiche la clé SVG à 4 dents', () => {
    render(<CleVivante />);
    const svg = screen.getByLabelText('Clé à quatre dents');
    expect(svg).toBeTruthy();
    expect(svg.querySelectorAll('rect').length).toBeGreaterThanOrEqual(4);
  });

  it('affiche les 4 pilules de dents', () => {
    render(<CleVivante />);
    expect(dentPills()).toHaveLength(4);
  });

  it('les libellés des dents proviennent d\'ASNAN (source unique, zéro littéral dupliqué)', () => {
    expect(DENTS.map((d) => d.nameAr)).toEqual(ASNAN.slice(0, 4).map((a) => a.nameAr));
    // Le composant n'insère aucun nom de dent en dur.
    for (const d of DENTS) {
      expect(SOURCE.includes(`>${d.nameAr}<`)).toBe(false);
    }
  });

  it('les dents sont فعل · دليل · علاقة · جواب', () => {
    expect(DENTS.map((d) => d.nameAr)).toEqual(['فعل', 'دليل', 'علاقة', 'جواب']);
  });

  it('couverture : 12 verbes, ids uniques, dents valides', () => {
    expect(VERBES_CLE).toHaveLength(12);
    expect(new Set(VERBES_CLE_ID).size).toBe(12);
    for (const v of VERBES_CLE) {
      expect(v.dents.length).toBeGreaterThan(0);
      for (const d of v.dents) {
        expect(d >= 1 && d <= 4).toBe(true);
      }
    }
  });
});

describe('cleVivante — clic dent → verbes réagissent (scénario élève)', () => {
  it('clic sur علاقة : verbes raisonnés allumés, descriptifs estompés', async () => {
    const user = userEvent.setup();
    render(<CleVivante />);

    const piluleAlaqa = dentPills().find((b) => b.textContent?.includes('علاقة'));
    expect(piluleAlaqa).toBeTruthy();
    await user.click(piluleAlaqa!);
    expect(piluleAlaqa!.getAttribute('aria-pressed')).toBe('true');

    const verbes = verbeButtons();
    expect(verbes).toHaveLength(12);
    // فَسِّرْ (reasoned, dents 1/2/3/4) : utilisé → class teal, pas de line-through.
    const fassir = verbes.find((b) => b.textContent?.includes('فَسِّرْ'));
    expect(fassir).toBeTruthy();
    expect(fassir!.className.includes('border-[#0e6b6b]')).toBe(true);
    expect(fassir!.className.includes('line-through')).toBe(false);
    expect(fassir!.getAttribute('data-ecarte')).toBeNull(); // il UTILISE علاقة → pas de ✕
    // حَلِّلْ (descriptif, dents 1/2/4) : non utilisé → estompé + barré + ✕ (data-ecarte).
    const hallil = verbes.find((b) => b.textContent?.includes('حَلِّلْ'));
    expect(hallil).toBeTruthy();
    expect(hallil!.className.includes('line-through')).toBe(true);
    expect(hallil!.getAttribute('data-ecarte')).toBe('true');
  });

  it('clic sur فعل : les 12 verbes sont utilisés', async () => {
    const user = userEvent.setup();
    render(<CleVivante />);
    const piluleFil = dentPills().find((b) => b.textContent?.includes('فعل'));
    expect(piluleFil).toBeTruthy();
    await user.click(piluleFil!);
    for (const b of verbeButtons()) {
      expect(b.classList.contains('border-[#0e6b6b]')).toBe(true);
      expect(b.classList.contains('line-through')).toBe(false);
    }
  });

  it('clic sur عَرِّفْ (via dent جواب) : la dent جواب est pressée', async () => {
    const user = userEvent.setup();
    render(<CleVivante />);
    const piluleJawab = dentPills().find((b) => b.textContent?.includes('جواب'));
    await user.click(piluleJawab!);
    expect(piluleJawab!.getAttribute('aria-pressed')).toBe('true');
  });
});

describe('cleVivante — clic verbe → dents réagissent (interaction inverse)', () => {
  it('clic sur فَسِّرْ (reasoned) allume les 4 dents', async () => {
    const user = userEvent.setup();
    render(<CleVivante />);
    const fassir = verbeButtons().find((b) => b.textContent?.includes('فَسِّرْ'));
    expect(fassir).toBeTruthy();
    await user.click(fassir!);
    // Les 4 dents réagissent : pilules en état « utilisé » (teal) ou actives.
    for (const p of dentPills()) {
      const allumee =
        p.classList.contains('border-[#c08a1f]') || p.classList.contains('border-[#0e6b6b]');
      expect(allumee).toBe(true);
    }
  });

  it('survol de حَلِّلْ (descriptif [1,2,4]) : 3 dents allumées, علاقة éteinte', async () => {
    const user = userEvent.setup();
    render(<CleVivante />);
    const hallil = verbeButtons().find((b) => b.textContent?.includes('حَلِّلْ'));
    expect(hallil).toBeTruthy();
    await user.hover(hallil!);
    for (const p of dentPills()) {
      const allumee =
        p.classList.contains('border-[#c08a1f]') || p.classList.contains('border-[#0e6b6b]');
      if (p.textContent?.includes('علاقة')) {
        expect(allumee).toBe(false);
      } else {
        expect(allumee).toBe(true);
      }
    }
  });

  it('survol de عَرِّفْ ([1,4]) : seules فعل et جواب allumées', async () => {
    const user = userEvent.setup();
    render(<CleVivante />);
    const arrif = verbeButtons().find((b) => b.textContent?.includes('عَرِّفْ'));
    expect(arrif).toBeTruthy();
    await user.hover(arrif!);
    for (const p of dentPills()) {
      const allumee =
        p.classList.contains('border-[#c08a1f]') || p.classList.contains('border-[#0e6b6b]');
      if (p.textContent?.includes('دليل') || p.textContent?.includes('علاقة')) {
        expect(allumee).toBe(false);
      } else {
        expect(allumee).toBe(true);
      }
    }
  });
});

describe('cleVivante — la dent brille (glow au clic sur le mot, owner 2026-11-13)', () => {
  function svgEl(): SVGSVGElement {
    return screen.getByLabelText('Clé à quatre dents') as unknown as SVGSVGElement;
  }

  it('au repos : aucune dent ne brille (data-brille false, zéro halo)', () => {
    render(<CleVivante />);
    const svg = svgEl();
    const dents = svg.querySelectorAll('[data-brille]');
    expect(dents.length).toBe(4);
    for (const d of dents) {
      expect(d.getAttribute('data-brille')).toBe('false');
    }
    expect(svg.querySelectorAll('[data-halo]').length).toBe(0);
  });

  it('clic sur le mot علاقة → la dent 3 brille : halo + lueur url(#cle-lueur…), les autres éteintes', async () => {
    const user = userEvent.setup();
    render(<CleVivante />);
    const svg = svgEl();
    const piluleAlaqa = dentPills().find((b) => b.textContent?.includes('علاقة'));
    expect(piluleAlaqa).toBeTruthy();
    await user.click(piluleAlaqa!);

    const dent3 = svg.querySelector('[data-testid="dent-3"]');
    expect(dent3).toBeTruthy();
    expect(dent3!.getAttribute('data-brille')).toBe('true');
    expect(dent3!.getAttribute('filter')).toMatch(/url\(#cle-lueur/);
    expect(svg.querySelector('[data-halo="3"]')).toBeTruthy();
    for (const id of ['1', '2', '4']) {
      expect(svg.querySelector(`[data-testid="dent-${id}"]`)!.getAttribute('data-brille')).toBe('false');
      expect(svg.querySelector(`[data-halo="${id}"]`)).toBeNull();
    }
  });

  it('clic sur le verbe فَسِّرْ → les 4 dents brillent ensemble (halo sur chacune)', async () => {
    const user = userEvent.setup();
    render(<CleVivante />);
    const svg = svgEl();
    const fassir = verbeButtons().find((b) => b.textContent?.includes('فَسِّرْ'));
    expect(fassir).toBeTruthy();
    await user.click(fassir!);
    for (const id of ['1', '2', '3', '4']) {
      const dent = svg.querySelector(`[data-testid="dent-${id}"]`);
      expect(dent).toBeTruthy();
      expect(dent!.getAttribute('data-brille')).toBe('true');
      expect(dent!.getAttribute('filter')).toMatch(/url\(#cle-lueur/);
      expect(svg.querySelector(`[data-halo="${id}"]`)).toBeTruthy();
    }
  });

  it('clic direct sur une dent de la clé = clic sur son mot (دليل → dent 2 pressée)', () => {
    render(<CleVivante />);
    const svg = svgEl();
    const dent2 = svg.querySelector('[data-testid="dent-2"]');
    expect(dent2).toBeTruthy();
    fireEvent.click(dent2!); // le clic remonte au <g data-dent="2" role="button">
    const piluleDalil = dentPills().find((b) => b.textContent?.includes('دليل'));
    expect(piluleDalil).toBeTruthy();
    expect(piluleDalil!.getAttribute('aria-pressed')).toBe('true');
    // et la dent 2 brille aussi
    expect(svg.querySelector('[data-testid="dent-2"]')!.getAttribute('data-brille')).toBe('true');
  });
});
