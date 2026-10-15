// manifestTwa.test.ts — le manifeste doit être utilisable par un magasin (H2).
//
// Une application Android construite depuis ce site (TWA via bubblewrap) lit
// `public/manifest.json` pour connaître l'identité de l'application, sa portée
// d'affichage et ses icônes. Trois de ces champs ne se voient PAS à l'usage dans
// un navigateur, mais décident du comportement de l'application installée : leur
// absence ne casse rien de visible, elle dégrade silencieusement.

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const RACINE = resolve(__dirname, '../..');
const MANIFESTE = JSON.parse(readFileSync(resolve(RACINE, 'public/manifest.json'), 'utf-8')) as {
  id?: string;
  scope?: string;
  start_url?: string;
  display?: string;
  lang?: string;
  dir?: string;
  theme_color?: string;
  categories?: string[];
  icons?: { src: string; sizes: string; purpose?: string }[];
};

describe('manifeste PWA — utilisable comme application installable', () => {
  it('a une identité STABLE (`id`) et une portée (`scope`)', () => {
    // Sans `id`, un changement d'URL de départ fait traiter l'application comme
    // nouvelle : deux icônes sur l'écran d'accueil et deux stockages séparés —
    // donc la progression de l'élève « disparaît ». Sans `scope`, un lien sortant
    // reste captif de la fenêtre sans barre d'adresse.
    expect(MANIFESTE.id).toBe('/');
    expect(MANIFESTE.scope).toBe('/');
    expect(MANIFESTE.start_url).toBe('/');
  });

  it('s’affiche en mode `standalone` : pas de barre d’adresse', () => {
    expect(MANIFESTE.display).toBe('standalone');
  });

  it('déclare l’arabe et le sens RTL (public réel de l’application)', () => {
    expect(MANIFESTE.lang).toBe('ar');
    expect(MANIFESTE.dir).toBe('rtl');
  });

  it('porte les DEUX icônes exigées par les magasins (192 et 512), plus la masquée', () => {
    const tailles = (MANIFESTE.icons ?? []).map((i) => i.sizes);
    expect(tailles, 'icône 192 manquante').toContain('192x192');
    expect(tailles, 'icône 512 manquante (exigée par Play)').toContain('512x512');
    expect(
      (MANIFESTE.icons ?? []).some((i) => i.purpose === 'maskable'),
      'aucune icône « maskable » : Android rognerait l’icône normale',
    ).toBe(true);
  });

  it('chaque icône déclarée existe réellement dans public/', () => {
    for (const icone of MANIFESTE.icons ?? []) {
      expect(existsSync(resolve(RACINE, 'public', icone.src.replace(/^\//, ''))), `${icone.src} introuvable`).toBe(
        true,
      );
    }
  });

  it('déclare une catégorie de magasin', () => {
    expect(MANIFESTE.categories).toContain('education');
  });

  it('garde la couleur de marque comme thème', () => {
    expect(MANIFESTE.theme_color).toBe('#006d37');
  });
});

describe('metadata.json — aucune capacité déclarée qui n’existe pas', () => {
  const METADATA = JSON.parse(readFileSync(resolve(RACINE, 'metadata.json'), 'utf-8')) as {
    description?: string;
    majorCapabilities?: string[];
  };

  it('ne déclare AUCUNE capacité serveur (le tuteur est local, sans clé API)', () => {
    // Le fichier annonçait `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` alors que le
    // dépôt ne contient ni SDK Gemini ni route LLM (grep : 0 occurrence). Une
    // capacité fausse est une promesse fausse — et en magasin, c'est une
    // déclaration trompeuse.
    expect(METADATA.majorCapabilities).toEqual([]);
  });

  it('ne revendique plus « بالذكاء الاصطناعي » dans sa description', () => {
    expect(METADATA.description).toBeTruthy();
    expect(METADATA.description).not.toContain('بالذكاء الاصطناعي');
    expect(METADATA.description).toContain('دون اتصال');
  });
});
