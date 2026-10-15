// politiqueHtml.test.ts — la page publique exigée par Google Play (H2).
//
// Play exige une URL de politique de confidentialité **publique**. La politique
// existait déjà, mais uniquement DANS l'application, derrière JavaScript : un
// relecteur qui ouvre l'URL sans exécuter le JavaScript ne voit rien, et un
// examinateur non arabophone ne peut pas la vérifier — deux motifs de rejet.
//
// Ces tests vérifient la page rendue telle qu'elle sera servie, sans navigateur.

import { describe, expect, it } from 'vitest';
import { rendrePolitiqueHtml, echapperHtml } from './politiqueHtml';
import {
  DERNIERE_MISE_A_JOUR,
  SECTIONS_CONFIDENTIALITE,
  SECTIONS_CONFIDENTIALITE_FR,
} from '../data/politiqueConfidentialite';

const HTML = rendrePolitiqueHtml();

describe('politique de confidentialité — page publique autonome', () => {
  it('ne contient AUCUN JavaScript : un relecteur doit tout voir', () => {
    expect(HTML).not.toMatch(/<script/i);
    // Aucune ressource externe non plus : la page reste lisible sans réseau.
    expect(HTML).not.toMatch(/<link[^>]+href="http/i);
    expect(HTML).not.toMatch(/@import/);
  });

  it('rend TOUTES les sections arabes, sans en perdre une', () => {
    for (const s of SECTIONS_CONFIDENTIALITE) {
      expect(HTML, `section arabe absente : ${s.titre}`).toContain(s.titre);
      for (const p of s.paragraphes) expect(HTML, p.slice(0, 40)).toContain(p.slice(0, 40));
    }
  });

  it('rend la version française, complète, pour la vérification par le relecteur', () => {
    expect(SECTIONS_CONFIDENTIALITE_FR).toHaveLength(SECTIONS_CONFIDENTIALITE.length);
    for (const s of SECTIONS_CONFIDENTIALITE_FR) {
      expect(HTML, `section française absente : ${s.titre}`).toContain(s.titre);
    }
  });

  it('dit explicitement quelle version fait foi (pas de flou juridique)', () => {
    expect(HTML).toContain('texte arabe fait foi');
    expect(HTML).toContain('المرجع');
  });

  it('porte la date de mise à jour et un contact', () => {
    expect(HTML).toContain(DERNIERE_MISE_A_JOUR);
    expect(HTML).toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
  });

  it('est un document HTML complet et autonome', () => {
    expect(HTML.startsWith('<!doctype html>')).toBe(true);
    expect(HTML).toContain('<html lang="ar" dir="rtl">');
    expect(HTML).toContain('<title>');
    expect(HTML.trimEnd().endsWith('</html>')).toBe(true);
    expect(HTML).toContain('</body>');
  });

  it('reste lisible en mode sombre, sans dépendre de JavaScript', () => {
    // Deux exigences réelles : lisibilité (contraste) et accessibilité (le
    // relecteur peut avoir un thème sombre forcé par son navigateur).
    expect(HTML).toContain('prefers-color-scheme: dark');
    expect(HTML).toContain('color-scheme: light dark');
  });

  it('échappe le contenu injecté (une page publique ne prend pas ce risque)', () => {
    expect(echapperHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    const piege = rendrePolitiqueHtml({ produit: 'Kunz <b>El</b> Ouloum', contact: 'a&b@c.dz' });
    expect(piege).not.toContain('<b>El</b>');
    expect(piege).toContain('a&amp;b@c.dz');
  });

  it('accepte une URL publique pour les métadonnées de partage', () => {
    const avec = rendrePolitiqueHtml({ urlPublique: 'https://exemple.dz/privacy' });
    expect(avec).toContain('<link rel="canonical" href="https://exemple.dz/privacy">');
    // Sans URL, aucune balise canonique vide ne traîne.
    expect(HTML).not.toContain('rel="canonical"');
  });
});

describe('route /privacy — câblage serveur', () => {
  it('server.ts sert la page par une route dédiée, avant le repli SPA', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const src = readFileSync(resolve(__dirname, '../../server.ts'), 'utf-8');
    expect(src).toContain('app.get("/privacy"');
    expect(src).toContain('rendrePolitiqueHtml');
    // La route doit être déclarée AVANT le catch-all `app.get("*")`, sinon le
    // repli SPA renverrait l'application au lieu de la politique.
    const position = src.indexOf('app.get("/privacy"');
    const repli = src.lastIndexOf('app.get("*"');
    expect(position, 'route /privacy déclarée après le repli SPA').toBeGreaterThan(0);
    expect(position).toBeLessThan(repli);
    // Content-Type explicite : sans lui, un navigateur peut afficher du texte brut.
    expect(src).toContain('text/html; charset=utf-8');
  });

  it('les deux routes précèdent le branchement Vite/statique (piège réel)', async () => {
    // DÉFAUT TROUVÉ PAR VÉRIFICATION DE BOUT EN BOUT, PAS PAR CE TEST — le test
    // d'origine ne comparait qu'au repli SPA `app.get("*")`, et il était vert
    // alors que les routes étaient insérées DANS le handler `/api/health` (le
    // `});` recherché était celui d'un `res.json(...)` imbriqué) : elles n'étaient
    // donc enregistrées qu'à l'appel de `/api/health`, et le serveur renvoyait
    // l'application au lieu de la politique. En développement, Vite répond AVANT
    // le repli SPA : la position par rapport à `createViteServer` est donc
    // l'invariant qui compte.
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const src = readFileSync(resolve(__dirname, '../../server.ts'), 'utf-8');
    const vite = src.indexOf('createViteServer(');
    const health = src.indexOf('app.get("/api/health"');
    expect(vite, 'createViteServer introuvable').toBeGreaterThan(0);
    expect(health, 'route /api/health introuvable').toBeGreaterThan(0);
    for (const route of ['app.get("/privacy"', '"/.well-known/assetlinks.json"']) {
      const position = src.indexOf(route);
      expect(position, `${route} absent`).toBeGreaterThan(0);
      expect(position, `${route} déclaré APRÈS le branchement Vite`).toBeLessThan(vite);
      expect(position, `${route} déclaré avant /api/health (bloc suspect)`).toBeGreaterThan(health);
    }
    // Et aucune route ne doit se retrouver à l'intérieur d'un handler : le
    // symptôme était une route déclarée après un `res.json(...)` de /api/health.
    const blocSante = src.slice(health, src.indexOf('});', src.indexOf('res.json', health)));
    expect(blocSante, 'une route a été insérée dans le handler /api/health').not.toContain('app.get("/privacy"');
  });

  it('la route Digital Asset Links précède aussi le repli SPA', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const src = readFileSync(resolve(__dirname, '../../server.ts'), 'utf-8');
    const position = src.indexOf('"/.well-known/assetlinks.json"');
    expect(position).toBeGreaterThan(0);
    expect(position).toBeLessThan(src.lastIndexOf('app.get("*"'));
    expect(src).toContain('application/json; charset=utf-8');
  });
});
