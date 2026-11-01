// fichePlay.test.ts — les textes de la fiche Play, vérifiés AVANT l'envoi.
//
// Une fiche refusée, c'est une publication retardée de plusieurs jours, et un
// texte qui promet une fonctionnalité inexistante expose à un retrait pour
// déclaration trompeuse. Ces contraintes sont mécaniques : autant les vérifier
// par machine plutôt qu'à l'œil, à chaque modification des textes.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const RACINE = resolve(__dirname, '../..');
const FICHE = JSON.parse(readFileSync(resolve(RACINE, 'store/fiche-play.json'), 'utf-8')) as {
  package_name_suggere: string;
  url_confidentialite: string;
  contact: string;
  locales: Record<string, Record<string, string>>;
};

/** Limites imposées par la Play Console (dépassement = saisie refusée). */
const LIMITES: Record<string, number> = {
  titre: 30,
  description_courte: 80,
  description_complete: 4000,
  nouveautes: 500,
};

const LOCALES = Object.keys(FICHE.locales);

describe('fiche Play — contraintes mécaniques de la console', () => {
  it('les deux langues du public sont présentes (arabe et français)', () => {
    expect(LOCALES).toEqual(['ar', 'fr']);
  });

  it('chaque champ respecte la limite de caractères de Google', () => {
    for (const loc of LOCALES) {
      for (const [champ, limite] of Object.entries(LIMITES)) {
        const valeur = FICHE.locales[loc][champ];
        expect(valeur, `${loc}.${champ} absent`).toBeTruthy();
        expect(valeur.length, `${loc}.${champ} : ${valeur.length} caractères pour ${limite} autorisés`)
          .toBeLessThanOrEqual(limite);
        // Un texte trop court est un signal d'alarme, pas une contrainte Play :
        // une description de trois mots fait refuser la fiche en pratique.
        expect(valeur.trim().length, `${loc}.${champ} suspicieusement court`).toBeGreaterThan(10);
      }
    }
  });

  it('le titre ne commence ni ne finit par un espace, et reste lisible en arabe', () => {
    for (const loc of LOCALES) {
      const titre = FICHE.locales[loc].titre;
      expect(titre).toBe(titre.trim());
      expect(titre).not.toContain('  ');
    }
  });
});

describe('fiche Play — honnêteté des promesses', () => {
  /**
   * Texte réellement PUBLIÉ — on exclut la note `_commentaire` du fichier : elle
   * sert à expliquer ces règles, elle n'est jamais envoyée à Google. (Un premier
   * jet de ces tests scannait le fichier entier ; il échouait sur sa propre note.)
   */
  const TEXTE_PUBLIE = LOCALES.flatMap((loc) => Object.values(FICHE.locales[loc])).join('\n');

  it('ne revendique aucune IA (le tuteur est un moteur local déterministe)', () => {
    // Constat d'audit §4.4 : `metadata.json` annonçait « بالذكاء الاصطناعي » alors
    // que le tuteur est local et déterministe. Une fiche qui reprendrait cette
    // promesse expose à un signalement pour déclaration trompeuse — et ce n'est
    // pas nécessaire : ce qui est vrai (hors ligne, gratuit, sans compte) est
    // déjà un argument plus fort pour le public visé.
    expect(TEXTE_PUBLIE).not.toMatch(/ذكاء اصطناعي|intelligence artificielle|\bIA\b/);
  });

  it('ANNONCE explicitement l’absence de publicité et d’achat (les deux langues)', () => {
    // Le fait est vérifié dans l'audit (§8 : aucune régie, aucun achat intégré).
    // Ce n'est pas seulement « ne pas mentir » : pour ce public, l'absence de
    // publicité est un argument — encore faut-il l'écrire.
    expect(FICHE.locales.ar.description_complete).toContain('لا إعلانات، ولا مشتريات داخلية');
    expect(FICHE.locales.fr.description_complete).toContain('aucune publicité, aucun achat intégré');
  });

  it('annonce le fonctionnement HORS LIGNE (vérifié : service worker + précache)', () => {
    expect(FICHE.locales.ar.description_complete).toContain('دون اتصال');
    expect(FICHE.locales.fr.description_complete).toContain('hors ligne');
  });

  it('dit explicitement que l’application ne remplace pas le professeur', () => {
    // Règle du dépôt (audit §6 verdict) : ne pas laisser croire à une couverture
    // complète. Les deux langues doivent le dire.
    expect(FICHE.locales.ar.description_complete).toContain('ليس بديلًا عن الأستاذ');
    expect(FICHE.locales.fr.description_complete).toMatch(/pas un remplacement du professeur/);
  });

  it('reconnaît les manques de contenu au lieu de les passer sous silence', () => {
    // Immunité innée et une partie de U11 sont absentes (audit H5). Les annoncer
    // dans la fiche est la seule position tenable pour un outil d'examen.
    expect(FICHE.locales.fr.description_complete).toMatch(/immunité innée/);
  });
});

describe('fiche Play — cohérence avec le dépôt', () => {
  it('l’URL de confidentialité correspond à la route réellement servie', () => {
    expect(FICHE.url_confidentialite).toMatch(/\/privacy$/);
    const src = readFileSync(resolve(RACINE, 'server.ts'), 'utf-8');
    expect(src).toContain('app.get("/privacy"');
  });

  it('le nom de paquet suggéré est un identifiant Android valide', () => {
    // Android exige au moins deux segments, en minuscules, chacun commençant par
    // une lettre ; il est impossible à changer après publication.
    expect(FICHE.package_name_suggere).toMatch(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/);
  });

  it('le contact est une adresse exploitable', () => {
    expect(FICHE.contact).toMatch(/^[\w.+-]+@[\w-]+\.[\w.]+$/);
  });

  it('le dossier store est autoportant : chaque étape du runbook existe', async () => {
    const { existsSync } = await import('node:fs');
    for (const f of ['README.md', 'fiche-play.json', 'data-safety.md', 'assetlinks.json']) {
      expect(existsSync(resolve(RACINE, 'store', f)), `store/${f} manquant`).toBe(true);
    }
  });
});
