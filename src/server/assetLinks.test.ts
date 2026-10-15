// assetLinks.test.ts — Digital Asset Links : le fichier qui efface la barre
// d'adresse de l'application Android (H2).
//
// Le défaut à empêcher n'est pas une erreur visible : c'est un fichier PRÉSENT
// mais inexploitable. Android rejette alors la vérification en silence, et
// l'application publiée s'ouvre avec la barre d'adresse du navigateur sans que
// personne ne comprenne pourquoi. Ces tests couvrent les quatre états réels.

import { describe, expect, it } from 'vitest';
import { verifierAssetLinks } from './assetLinks';

/** Fichier réellement valide (empreinte de 32 octets, format Android). */
const VALIDE = JSON.stringify([
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'dz.kunzelouloum.app',
      sha256_cert_fingerprints: [
        'A1:B2:C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90:A1:B2:C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90',
      ],
    },
  },
]);

describe('verifierAssetLinks — les quatre états du fichier', () => {
  it('fichier absent : refus explicite, pas de crash', () => {
    const v = verifierAssetLinks(null);
    expect(v.statut).toBe('absent');
    expect(v.message).toContain('store/README.md');
    expect(v.json).toBeUndefined();
  });

  it('fichier vide : traité comme absent', () => {
    expect(verifierAssetLinks('   \n').statut).toBe('absent');
  });

  it('gabarit non renseigné : refusé, et le message dit quoi faire', () => {
    // C'est le cas du dépôt au 14/10/2026 : le fichier existe, mais avec des
    // marqueurs. Le servir tel quel ne débloquerait rien.
    const gabarit = JSON.stringify([
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'REMPLACER.par.le.nom.de.paquet',
          sha256_cert_fingerprints: ['REMPLACER_PAR_L_EMPREINTE_SHA256_DU_CERTIFICAT_DE_SIGNATURE'],
        },
      },
    ]);
    const v = verifierAssetLinks(gabarit);
    expect(v.statut).toBe('placeholder');
    expect(v.message).toContain('barre d’adresse');
  });

  it('JSON malformé : refusé avec le détail de l’erreur', () => {
    const v = verifierAssetLinks('{ ceci n est pas du json }');
    expect(v.statut).toBe('invalide');
    expect(v.message).toContain('JSON');
  });

  it('structure incomplète : refusé, champ par champ', () => {
    const sansPaquet = JSON.parse(VALIDE) as Record<string, unknown>[];
    delete (sansPaquet[0].target as Record<string, unknown>).package_name;
    expect(verifierAssetLinks(JSON.stringify(sansPaquet)).statut).toBe('invalide');

    const sansEmpreinte = JSON.parse(VALIDE) as Record<string, unknown>[];
    (sansEmpreinte[0].target as Record<string, unknown>).sha256_cert_fingerprints = [];
    expect(verifierAssetLinks(JSON.stringify(sansEmpreinte)).statut).toBe('invalide');

    const mauvaisNamespace = JSON.parse(VALIDE) as Record<string, unknown>[];
    (mauvaisNamespace[0].target as Record<string, unknown>).namespace = 'web';
    expect(verifierAssetLinks(JSON.stringify(mauvaisNamespace)).statut).toBe('invalide');
  });

  it('empreinte au mauvais format : refusée (32 octets hexadécimaux majuscules)', () => {
    const tropCourte = JSON.parse(VALIDE) as Record<string, unknown>[];
    (tropCourte[0].target as Record<string, unknown>).sha256_cert_fingerprints = ['A1:B2:C3'];
    expect(verifierAssetLinks(JSON.stringify(tropCourte)).statut).toBe('invalide');

    const minuscules = JSON.parse(VALIDE) as Record<string, unknown>[];
    (minuscules[0].target as Record<string, unknown>).sha256_cert_fingerprints = [
      'a1:b2:c3:d4:e5:f6:07:18:29:3a:4b:5c:6d:7e:8f:90:a1:b2:c3:d4:e5:f6:07:18:29:3a:4b:5c:6d:7e:8f:90',
    ];
    expect(verifierAssetLinks(JSON.stringify(minuscules)).statut).toBe('invalide');
  });

  it('fichier valide : servi, et le verdict porte le JSON à envoyer', () => {
    const v = verifierAssetLinks(VALIDE);
    expect(v.statut).toBe('valide');
    expect(v.json).toEqual(JSON.parse(VALIDE));
  });
});

describe('le gabarit du dépôt est bien un gabarit', () => {
  it('store/assetlinks.json est refusé par le serveur tant qu’il n’est pas renseigné', async () => {
    // Garantie de non-publication accidentelle : tant que l'empreinte n'est pas
    // réelle, la route renvoie 404 (et le journal dit pourquoi).
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const contenu = readFileSync(resolve(__dirname, '../../store/assetlinks.json'), 'utf-8');
    const v = verifierAssetLinks(contenu);
    expect(['placeholder', 'invalide'], `gabarit servi comme valide : ${v.statut}`).toContain(v.statut);
  });
});
