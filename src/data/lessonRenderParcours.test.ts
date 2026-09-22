// Parcours automatisé de rendu — les 47 clés du viewer passent par le VRAI
// pipeline (getter ?raw → sliceLessonHtml) et le HTML produit pour l iframe
// srcdoc est contrôlé structurellement. Objectif : attraper la classe de bugs
// « ça ne s affiche pas sur l application » AVANT l élève (rendu app ≠ fichier brut).
import { describe, expect, it } from 'vitest';
import { LESSON_HTML_GETTERS } from './lessonHtmlGetters';
import { sliceLessonHtml, countLessonChapters, getBaseLessonKey } from './lessonChapterSplit';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const PUBLIC = resolve(__dirname, '../../public');
const KEYS = Object.keys(LESSON_HTML_GETTERS);

describe('parcours de rendu — invariants du HTML effectivement rendu dans le viewer', () => {
  it('le catalogue couvre exactement les fichiers de leçons sur disque (0 trou, 0 orphelin)', () => {
    const onDisk = readdirSync(resolve(PUBLIC, 'lessons')).filter((f) => f.endsWith('.html'));
    // NB : phase1_chapitres_1_2 SE TERMINE légitimement par _2 (piège documenté) —
    // la clé de base se détermine par la forme canonique, jamais par un replace naïf.
    const bases = new Set(KEYS.map(getBaseLessonKey));
    expect(KEYS.length).toBe(47);
    for (const f of onDisk) expect(bases.has(f.replace(/\.html$/, '')), `fichier orphelin : ${f}`).toBe(true);
    for (const b of bases) expect(existsSync(resolve(PUBLIC, 'lessons', `${b}.html`)), `getter sans fichier : ${b}`).toBe(true);
  });

  for (const key of KEYS) {
    it(`${key} : doc complet, chapitre actif unique, zéro lien mort, divs équilibrés, assets absolus`, async () => {
      const mod = await LESSON_HTML_GETTERS[key]();
      const raw = mod.default as string;
      const slice = sliceLessonHtml(raw, key);

      // 1. Document complet pour srcdoc
      expect(slice, 'doctype absent').toContain('<!DOCTYPE html');
      expect(slice.trim().endsWith('</html>'), 'doc non fermé (truncation ?)').toBe(true);

      // 2. Un seul chapitre actif quand le fichier en contient plusieurs
      const nChapters = countLessonChapters(raw);
      const nActive = (slice.match(/class="[^"]*chapter-view active[^"]*"/g) || []).length;
      if (nChapters >= 2) expect(nActive, 'actif ≠ 1').toBe(1);
      // Script de nav : injecté par le slicing (fichiers multi-chapitres) ou défini
      // par la leçon elle-même (leçons spéciales mono-chapitre).
      const usesScrollToStep = /onclick="scrollToStep\(/.test(slice);
      if (usesScrollToStep || nChapters >= 2) {
        expect(/window\.scrollToStep|function\s+scrollToStep/.test(slice), 'script de nav absent').toBe(true);
      }

      // 3. Divs équilibrés (aucune troncature de bloc)
      expect((slice.match(/<div\b/g) || []).length).toBe((slice.match(/<\/div>/g) || []).length);

      // 4. Zéro lien mort : chaque cible #id référencée existe dans le slice rendu.
      //    On retire les CORPS <script> : les liens construits en JS (badges…)
      //    sont conditionnels à des éléments qui sont tranchés avec leur bloc.
      const htmlOnly = slice.replace(/<script\b[\s\S]*?<\/script>/g, '');
      const targets = new Set<string>();
      for (const m of htmlOnly.matchAll(/href="#([^"]+)"/g)) {
        if (m[1]) targets.add(m[1]);
      }
      for (const m of htmlOnly.matchAll(/scrollToStep\('([^']+)'/g)) targets.add(m[1]);
      const missing = [...targets].filter((t) => !htmlOnly.includes(`id="${t}"`));
      expect(missing, `liens morts (${missing.length}) : ${missing.slice(0, 6).join(', ')}`).toEqual([]);

      // 5. Ids uniques (le slicing ne doit pas dupliquer la zone commune)
      const ids = [...slice.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
      const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
      expect(dup, `ids dupliqués : ${[...new Set(dup)].slice(0, 6).join(', ')}`).toEqual([]);

      // 6. Assets : chemins ABSOLUS (srcdoc — les relatifs sont cassés) et fichiers existants
      for (const m of slice.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
        expect(existsSync(resolve(PUBLIC, m[1].replace(/^\//, ''))), `asset manquant : ${m[1]}`).toBe(true);
      }
      for (const m of slice.matchAll(/(?:src|href)="(?!\/|data:|https?:|#)([^"]{4,})"/g)) {
        expect(m[1], `chemin relatif cassé (srcdoc) : ${m[1]}`).not.toMatch(/\.(png|jpe?g|svg|css|js)$/i);
      }
    });
  }
});
