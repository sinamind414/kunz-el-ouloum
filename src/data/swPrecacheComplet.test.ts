// swPrecacheComplet.test.ts — le service worker précache-t-il TOUT ce qu'il sert ?
//
// Défaut trouvé le 14/10/2026 (audit, H5) : `public/lessons/` contenait 25 leçons,
// `CORE_URLS` du service worker n'en précachait que 23. Les deux absentes
// (`lecon_representation.html`, `lecon_activite_structure.html`) sont pourtant
// bien SERVIES par l'application — `lessonHtmlGetters.ts` les charge en `?raw`.
// Conséquence réelle pour le public visé : un élève en zone mal couverte qui
// ouvre ces leçons pour la première fois hors ligne tombe sur un écran vide,
// alors que c'est exactement le cadre d'usage pour lequel l'application est
// conçue (aucune API, tout local).
//
// Ce test est un verrou de COHÉRENCE, pas de volume : il n'interdit pas d'ajouter
// du contenu, il interdit d'en servir sans le précacher. Il tourne dans la suite
// unitaire (`npm run test:vitest`), donc dans la CI, sur un simple checkout.

import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const RACINE = resolve(__dirname, '../..');
const SW = readFileSync(resolve(RACINE, 'public/sw.js'), 'utf-8');
const LEÇONS = readdirSync(resolve(RACINE, 'public/lessons')).filter((f) => f.endsWith('.html'));

/**
 * URLs du tableau CORE_URLS (liste littérale, seule partie « toujours précachée »).
 *
 * Lecture LIGNE PAR LIGNE et non par expression régulière sur toute la zone :
 * un commentaire contenant une apostrophe (par ex. « l'application ») suffisait
 * à désynchroniser le découpage et à faire croire que 24 leçons manquaient.
 * Un verrou doit signaler un vrai défaut, pas la typographie d'un commentaire.
 */
function coreUrls(): string[] {
  const debut = SW.indexOf('const CORE_URLS = [');
  expect(debut, 'CORE_URLS introuvable dans public/sw.js').toBeGreaterThan(-1);
  const fin = SW.indexOf('];', debut);
  return SW.slice(debut, fin)
    .split('\n')
    .map((ligne) => ligne.match(/^\s*'(\/[^']*)',?\s*$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => m[1]);
}

describe('service worker — précache cohérent avec ce que l’application sert', () => {
  const urls = coreUrls();

  it('le précache n’est pas vide (garde-fou du garde-fou)', () => {
    expect(urls.length).toBeGreaterThan(20);
  });

  it('précache TOUTES les leçons HTML sur disque, sans exception', () => {
    const manquantes = LEÇONS.filter((f) => !urls.includes(`/lessons/${f}`));
    expect(
      manquantes,
      `leçon(s) servie(s) par l’app mais absente(s) du précache : ${manquantes.join(', ')}`,
    ).toEqual([]);
  });

  it('ne précache aucune ressource inexistante', () => {
    // Un `cache.add()` qui échoue n'annule pas l'installation (best effort),
    // donc une URL fantôme passerait inaperçue : on la refuse ici.
    //
    // `/` et `/index.html` ne viennent PAS de public/ : Vite les produit depuis
    // `index.html`, à la racine du dépôt (vérifié juste avant).
    expect(readFileSync(resolve(RACINE, 'index.html'), 'utf-8').length).toBeGreaterThan(100);
    const fantomes = urls.filter((u) => {
      if (u === '/' || u === '/index.html') return false;
      const chemin = resolve(RACINE, 'public', u.replace(/^\//, ''));
      try {
        readFileSync(chemin);
        return false;
      } catch {
        return true;
      }
    });
    expect(fantomes, `URL(s) précachée(s) mais absente(s) de public/ : ${fantomes.join(', ')}`).toEqual([]);
  });

  it('garde les deux leçons du défaut d’origine, nommément', () => {
    // Un test générique suffit à empêcher le retour du défaut ; ce test-ci existe
    // pour que la régression soit nommée si elle revient.
    for (const f of ['lecon_representation.html', 'lecon_activite_structure.html']) {
      expect(urls, `${f} a disparu du précache`).toContain(`/lessons/${f}`);
    }
  });
});
