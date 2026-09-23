// P2 — hygiène des schémas : source unique + a11y <title>.
// · le doublon mort public/images/schemas (121 fichiers) est interdit ;
// · chaque SVG live de public/assets/images/schemas porte un <title> non vide ;
// · le manifest SW ne référence que /assets/images/schemas/.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const LIVE = path.join(ROOT, 'public', 'assets', 'images', 'schemas');
const DEAD = path.join(ROOT, 'public', 'images', 'schemas');

function listSvg(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name.endsWith('.svg')) out.push(p);
    }
  };
  walk(dir);
  return out;
}

describe('schemas P2 — source unique + a11y', () => {
  it('aucun doublon public/images/schemas (le live est public/assets/images/schemas)', () => {
    expect(fs.existsSync(DEAD), `doublon mort présent : ${DEAD}`).toBe(false);
    expect(fs.existsSync(LIVE)).toBe(true);
  });

  it('chaque SVG live porte un <title> non vide', () => {
    const svgs = listSvg(LIVE);
    expect(svgs.length).toBeGreaterThanOrEqual(100);
    const missing: string[] = [];
    for (const f of svgs) {
      const src = fs.readFileSync(f, 'utf-8');
      const m = src.match(/<title[^>]*>([^<]+)<\/title>/);
      if (!m || !m[1].trim()) missing.push(path.relative(ROOT, f));
    }
    expect(missing, `SVG sans <title> : ${missing.slice(0, 8).join(', ')}`).toEqual([]);
  });

  it('manifest SW ne référence que /assets/images/schemas/', () => {
    const manifestPath = path.join(LIVE, 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);
    const raw = fs.readFileSync(manifestPath, 'utf-8');
    const urls: string[] = raw.match(/"[^"]+"/g) ?? [];
    const bad: string[] = urls.filter((u) => u.includes('"/images/schemas/'));
    expect(bad).toEqual([]);
    expect(raw.includes('/assets/images/schemas/')).toBe(true);
  });
});
