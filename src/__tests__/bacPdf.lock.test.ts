// bacPdf.lock.test.ts - VERROU des PDF officiels embarques (rubrique sujet
// BAC). Regle : l'UI n'affiche un bouton « حمّل الموضوع الأصلي » QUE si
// l'entree existe, et chaque entree DOIT pointer vers un PDF reel sur
// disque (public/bac-sujets/**) qui commence par l'octet-magique %PDF.
// Jamais de lien mort, jamais de fichier orphelin non indexe.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BAC_PDF_INDEX, cheminPdfBac, pdfBacDisponible } from '../data/bacPdfIndex';

const RACINE_PUBLIC = resolve(__dirname, '../../public');

describe('index des PDF officiels (bac-sujets)', () => {
  it('couvre 2013-2026, sujets 1 et 2, session principale uniquement', () => {
    const annees = [...new Set(BAC_PDF_INDEX.map((e) => e.year))].sort((a, b) => a - b);
    expect(annees[0]).toBe(2013);
    expect(annees[annees.length - 1]).toBe(2026);
    for (const annee of annees) {
      expect(
        BAC_PDF_INDEX.filter((e) => e.year === annee).map((e) => e.sujet),
        `annee ${annee}`,
      ).toEqual([1, 2]);
    }
    for (const e of BAC_PDF_INDEX) expect(e.session).toBe('main');
  });

  it('CHACUNE des entrees pointe vers un vrai PDF sur disque (octet-magique %PDF)', () => {
    for (const e of BAC_PDF_INDEX) {
      const disque = join(RACINE_PUBLIC, e.chemin.replace(/^\//, ''));
      expect(existsSync(disque), `fichier manquant : ${e.chemin}`).toBe(true);
      const taille = statSync(disque).size;
      expect(taille, `fichier vide : ${e.chemin}`).toBeGreaterThan(10_000);
      const tete = readFileSync(disque).subarray(0, 5).toString('latin1');
      expect(tete.startsWith('%PDF-'), `pas un PDF : ${e.chemin}`).toBe(true);
    }
  });

  it('reciproque : aucun PDF orphelin sur disque sans entree dans l index', () => {
    const surDisque: string[] = [];
    for (const annee of readdirSync(RACINE_PUBLIC + '/bac-sujets')) {
      for (const f of readdirSync(join(RACINE_PUBLIC, 'bac-sujets', annee))) {
        if (f.endsWith('.pdf')) surDisque.push(`/bac-sujets/${annee}/${f}`);
      }
    }
    const indexees = new Set(BAC_PDF_INDEX.map((e) => e.chemin));
    for (const chemin of surDisque) {
      expect(indexees.has(chemin), `PDF non indexe : ${chemin}`).toBe(true);
    }
    expect(surDisque.length).toBe(BAC_PDF_INDEX.length);
  });

  it('aucun caractere parasite (CJK/cyrillique) dans l index', () => {
    const src = JSON.stringify(BAC_PDF_INDEX);
    const cjk = [...src].filter((c) => c.codePointAt(0)! >= 0x4e00 && c.codePointAt(0)! <= 0x9fff).length;
    const cyr = [...src].filter((c) => c.codePointAt(0)! >= 0x400 && c.codePointAt(0)! <= 0x4ff).length;
    expect(cjk).toBe(0);
    expect(cyr).toBe(0);
  });

  it('API : cheminPdfBac / pdfBacDisponible — jamais de promesse creuse', () => {
    expect(pdfBacDisponible(2019, 1)).toBe(true);
    expect(cheminPdfBac(2019, 1)).toBe('/bac-sujets/2019/sujet-1.pdf');
    // pas de PDF blancs (sujets originaux de l'app, pas de fichier derriere)
    expect(pdfBacDisponible(2025, 1) && pdfBacDisponible(2025, 2)).toBe(true);
  });
});
