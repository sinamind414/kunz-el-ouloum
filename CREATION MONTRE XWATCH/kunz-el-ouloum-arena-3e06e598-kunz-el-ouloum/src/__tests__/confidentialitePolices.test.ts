// confidentialitePolices.test.ts — verrou B8 (audit « ligne par ligne »
// 2026-10-17). DÉFAUT : la promesse « aucune requête ne quitte le téléphone »
// était contredite par conception — @import Google Fonts dans index.css ET
// fonts.googleapis.com/fonts.gstatic.com explicitement autorisés dans la CSP
// de server.ts. AVANT le fix, ce verrou aurait été ROUGE sur les deux points.
// Fix (2026-10-17) : 8 woff2 OFL auto-hébergés dans public/fonts/ (servis
// par 'self'), @font-face locaux avec unicode-range conservés, CSP nettoyée.
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const CSS = readFileSync(resolve(__dirname, '../index.css'), 'utf8');
const SERVER = readFileSync(resolve(__dirname, '../../server.ts'), 'utf8');
const FONTS_DIR = resolve(__dirname, '../../public/fonts');

describe('B8 — la promesse de confidentialité est conforme à la configuration', () => {
  it('aucune origine Google Fonts dans le CSS ni dans la CSP', () => {
    expect(CSS.includes('fonts.googleapis.com')).toBe(false);
    expect(CSS.includes('fonts.gstatic.com')).toBe(false);
    expect(SERVER.includes('fonts.googleapis.com')).toBe(false);
    expect(SERVER.includes('fonts.gstatic.com')).toBe(false);
  });

  it('la CSP n autorise que self pour les styles et les polices', () => {
    expect(SERVER).toMatch(/"style-src 'self' 'unsafe-inline'"/);
    expect(SERVER).toMatch(/"font-src 'self' data:"/);
  });

  it('les woff2 auto-hébergés existent et sont tous référencés en local', () => {
    const woff2 = readdirSync(FONTS_DIR).filter((f) => f.endsWith('.woff2'));
    expect(woff2.length).toBeGreaterThanOrEqual(8);
    for (const f of woff2) {
      expect(CSS.includes(`/fonts/${f}`), `police non référencée : ${f}`).toBe(true);
    }
    // Chaque URL de police pointe vers 'self' (jamais un domaine externe).
    const urls = CSS.match(/url\('([^']+)'\)/g) ?? [];
    for (const u of urls) {
      expect(u.startsWith("url('/fonts/"), `URL non locale détectée : ${u}`).toBe(true);
    }
  });

  it('font-display swap conservé (pas de texte invisible pendant le chargement)', () => {
    expect(CSS.includes('font-display: swap')).toBe(true);
  });
});
