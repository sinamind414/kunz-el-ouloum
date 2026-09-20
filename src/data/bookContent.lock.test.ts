// bookContent.lock.test.ts — verrous de l'ingestion du manuel (audit 2026-09-20).
// data/bookContent.json = la SOURCE UNIQUE textuelle du livre officiel (OCR 6105
// lignes). Ces tests garantissent que toute régénération du JSON repasse par les
// mêmes preuves : texte réel (taille + ratio arabe + couverture), grille TDM
// 3/11/55 exacte, et localisation réelle des titres de chapitres (≥47/55, valeur
// figée mesurée après correction du norm — voir ci-dessous).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const brut = readFileSync(join(process.cwd(), 'data', 'bookContent.json'), 'utf-8');
const d = JSON.parse(brut) as {
  schema_version: string;
  control_grid: {
    domains: number;
    units: number;
    chapters: number;
    structure: { units: { chapters: unknown[] }[] }[];
  };
  book: { full_text: string[] };
  warnings: unknown[];
  rule_compliance: Record<string, unknown>;
};
const lignes: string[] = d.book.full_text;
const texte = lignes.join('\n');
const tdm = readFileSync(join(process.cwd(), 'book_tdm_clean.md'), 'utf-8');

function norm(s: string): string {
  // toLowerCase AVANT le filtre : sinon les majuscules latines (ADN, pH, LT…)
  // tombent hors de la classe gardée et sont détruites (bug corrigé 2026-09-20,
  // aligné sur scripts/build_chapter_index.ts).
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
const nTexte = norm(texte);

describe('data/bookContent.json — la source unique du manuel reste vérifiée', () => {
  it('structure contractuelle présente (schema, grille, texte, warnings, règle)', () => {
    for (const k of ['schema_version', 'control_grid', 'book', 'book_meta', 'sources', 'warnings', 'rule_compliance'])
      expect((d as Record<string, unknown>)[k], `clé ${k}`).toBeDefined();
  });

  it('texte réel : ≥300 000 caractères, ≥70 % arabe, couverture du livre présente', () => {
    expect(texte.length).toBeGreaterThanOrEqual(300_000);
    const ar = (texte.match(/[\u0600-\u06FF]/g) ?? []).length;
    expect(ar / texte.length).toBeGreaterThan(0.7);
    expect(nTexte).toContain(norm('كتاب علوم الطبيعة والحياة'));
  });

  it('grille TDM : exactement 3 domaines / 11 unités / 55 chapitres', () => {
    expect(d.control_grid.domains).toBe(3);
    expect(d.control_grid.units).toBe(11);
    expect(d.control_grid.chapters).toBe(55);
    expect(d.control_grid.structure).toHaveLength(3);
    expect(d.control_grid.structure.flatMap((x) => x.units)).toHaveLength(11);
    expect(d.control_grid.structure.flatMap((x) => x.units.flatMap((u) => u.chapters))).toHaveLength(55);
  });

  it('les 55 titres AR de la TDM (fichier propre) existent ; ≥47 se localisent dans le texte', () => {
    const titresAr = (tdm.match(/^\d+\.\s*(.+)$/gm) ?? []).map((l) =>
      norm(l.replace(/^\d+\.\s*/, '').split(/\s*-\s*/)[0].trim())
    );
    expect(titresAr).toHaveLength(55);
    const localises = titresAr.filter((t) => t.length > 2 && nTexte.includes(t)).length;
    // 47 = mesure corrigée (2026-09-20) après réparation du norm (majuscules
    // latines restaurées → titres plus spécifiques → moins de faux positifs).
    // Les 55/55 sont garantis par le verrou d'index (bookIndex.lock.test.ts),
    // qui utilise les mêmes passes de tolérance OCR que le builder.
    expect(localises).toBeGreaterThanOrEqual(47);
  });

  it('aucun chapitre fabriqué : 55 chapitres numérotés dans la TDM du dépôt', () => {
    expect((tdm.match(/^\d+\.\s/gm) ?? []).length).toBe(55);
  });

  it('les warnings honnêtes sont préservés (mojibake TDM assumé)', () => {
    expect(d.warnings.length).toBeGreaterThanOrEqual(1);
  });
});
