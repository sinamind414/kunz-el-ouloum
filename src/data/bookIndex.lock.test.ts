// bookIndex.lock.test.ts — verrous de l'index de localisation des 55 chapitres
// (audit 2026-09-20). data/bookContent.index.json est RÉGÉNÉRABLE par
// scripts/build_chapter_index.ts ; aucun chapitre n'y est « placé à la main » :
// affectation monotone, passes de tolérance OCR décroissantes, et 3 exceptions
// DOCUMENTÉES (chapitres 18-20 : en-têtes détruits par l'OCR, ancres vérifiées).
// Ces tests figent la mesure : si la source OCR change, le build ÉCHOUE
// (validation d'ancre) et ces verrous détectent tout décalage.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function norm(s: string): string {
  // Identique à scripts/build_chapter_index.ts et bookContent.lock.test.ts :
  // toLowerCase AVANT le filtre (sinon les majuscules latines sont détruites).
  return s
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[إأآٱا]/g, 'ا')
    .replace(/ء/g, '')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\u0600-\u06FF a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const idx = JSON.parse(
  readFileSync(join(process.cwd(), 'data', 'bookContent.index.json'), 'utf-8')
) as {
  schema_version: string;
  generated_utc: string;
  source: { fichier: string; octets: number; sha256: string; lignes_ocr: number };
  methode: string;
  grille: { domains: number; units: number; chapters: number };
  tdm_du_livre: { fin: number };
  stats: Record<string, number>;
  preamble: { debut: number; fin: number };
  chapitres: {
    domain: number;
    unit: number;
    chapter: number;
    titreAr: string;
    ligneDebut: number;
    ligneFin: number;
    mode: string;
    evidence: string;
    tiges?: string[];
    ambigu?: boolean;
  }[];
};

const brut = readFileSync(join(process.cwd(), 'data', 'bookContent.json'), 'utf-8');
const livre = JSON.parse(brut) as {
  book: { full_text: string[] };
  control_grid: {
    structure: { domain: number; units: { unit: number; chapters: unknown[] }[] }[];
  };
};
const lignes: string[] = livre.book.full_text;
const nLignes = lignes.map(norm);
// comptes de chapitres par unité, dérivés de la GRILLE SOURCE (pas figés à la main)
const attendusParUnite = livre.control_grid.structure.flatMap((dom) =>
  dom.units.map((u) => `${dom.domain}:${u.unit}:${u.chapters.length}`)
);

describe('data/bookContent.index.json — index de localisation des 55 chapitres', () => {
  it('cohérence avec la source : octets de bookContent.json + 6105 lignes OCR', () => {
    expect(idx.schema_version).toBe('1.0');
    expect(idx.source.fichier).toBe('data/bookContent.json');
    expect(idx.source.lignes_ocr).toBe(6105);
    // Le sha256 source est recomposé à CHAQUE régénération par le builder (qui
    // échoue si la source change). Ici : liaison par taille d'octets exacte
    // (createHash n'est pas disponible sous l'env vitest de ce dépôt).
    expect(idx.source.octets).toBe(Buffer.byteLength(brut, 'utf-8'));
  });

  it('55 chapitres numérotés 1..55, comptes par unité = grille 3/11/55', () => {
    expect(idx.chapitres).toHaveLength(55);
    expect(idx.chapitres.map((c) => c.chapter)).toEqual(Array.from({ length: 55 }, (_, i) => i + 1));
    const parUnite = new Map(idx.chapitres.map((c) => [`${c.domain}:${c.unit}`, 0]));
    for (const c of idx.chapitres) parUnite.set(`${c.domain}:${c.unit}`, (parUnite.get(`${c.domain}:${c.unit}`) ?? 0) + 1);
    const obtenu = [...parUnite.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${k}:${v}`);
    expect(obtenu).toEqual(attendusParUnite);
    expect(parUnite.size).toBe(11);
  });

  it('monotonie stricte des débuts ; chaque chapitre couvre [ligneDebut, ligneFin] contigu', () => {
    for (let i = 0; i < idx.chapitres.length; i++) {
      const c = idx.chapitres[i];
      expect(c.ligneFin, `C${c.chapter}`).toBeGreaterThanOrEqual(c.ligneDebut);
      if (i === 0) expect(c.ligneDebut).toBe(idx.preamble.fin + 1);
      else expect(c.ligneDebut, `C${c.chapter} après C${idx.chapitres[i - 1].chapter}`).toBe(
        idx.chapitres[i - 1].ligneFin + 1
      );
      expect(c.ligneDebut, `C${c.chapter} dans le texte`).toBeGreaterThanOrEqual(idx.tdm_du_livre.fin + 1);
    }
    expect(idx.chapitres[54].ligneFin).toBe(lignes.length - 1);
  });

  it('modes figés : 42 verbatim-ligne, 10 tiges, 2 ancre-documentee, 1 inferred-borne', () => {
    const reel: Record<string, number> = {};
    for (const c of idx.chapitres) reel[c.mode] = (reel[c.mode] ?? 0) + 1;
    expect(reel['verbatim-ligne']).toBe(42);
    expect(reel['tiges']).toBe(10);
    expect(reel['ancre-documentee']).toBe(2);
    expect(reel['inferred-borne']).toBe(1);
    expect(Object.values(reel).reduce((a, b) => a + b, 0)).toBe(55);
    expect(idx.stats).toEqual(reel);
  });

  it('exactement 3 chapitres ambigus, DOCUMENTÉS : 18 borné, 19 et 20 ancrés', () => {
    const ambigus = idx.chapitres.filter((c) => c.ambigu);
    expect(ambigus.map((c) => c.chapter)).toEqual([18, 19, 20]);
    expect(ambigus[0].mode).toBe('inferred-borne');
    expect(ambigus[1].mode).toBe('ancre-documentee');
    expect(ambigus[2].mode).toBe('ancre-documentee');
    for (const c of ambigus) expect(c.evidence.length).toBeGreaterThan(20);
  });

  it('ancres vérifiées contre le texte : l.1797 (طرق) et l.1850 (مصدر LTc)', () => {
    const c19 = idx.chapitres[18];
    const c20 = idx.chapitres[19];
    expect(c19.ligneDebut).toBe(1797);
    expect(nLignes[1797]).toContain('اللمفاويات');
    expect(nLignes[1797]).toContain('تاثير');
    expect(c20.ligneDebut).toBe(1850);
    expect(nLignes[1850]).toContain('مصدر اللمفاويات');
  });

  it('en-têtes fiables spot-checkés : C13@1284, C24@2424, C15@1585, C55 fin de texte', () => {
    const de = (n: number) => idx.chapitres[n - 1];
    expect(norm(lignes[de(13).ligneDebut])).toContain(norm('تذكير بالمكتسبات'));
    expect(de(13).ligneDebut).toBe(1284);
    expect(de(24).ligneDebut).toBe(2424);
    expect(norm(lignes[de(24).ligneDebut])).toContain(norm('تذكير بالمكتسبات'));
    expect(de(15).ligneDebut).toBe(1585);
    expect(de(55).ligneFin).toBe(lignes.length - 1);
    expect(norm(lignes[de(55).ligneDebut])).toContain(norm('شواهد'));
  });

  it('tout chapitre a une preuve non vide ; chaque titre AR est celui de la TDM propre', () => {
    const tdm = readFileSync(join(process.cwd(), 'book_tdm_clean.md'), 'utf-8');
    const titresTdm = (tdm.match(/^\d+\.\s*(.+)$/gm) ?? []).map((l) =>
      l.replace(/^\d+\.\s*/, '').split(/\s*-\s*/)[0].trim()
    );
    expect(titresTdm).toHaveLength(55);
    for (const c of idx.chapitres) {
      expect(c.evidence.length, `C${c.chapter}`).toBeGreaterThan(0);
      expect(c.titreAr, `C${c.chapter}`).toBe(titresTdm[c.chapter - 1]);
    }
  });
});
