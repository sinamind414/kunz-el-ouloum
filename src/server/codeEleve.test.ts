// codeEleve.test.ts — inscription sans e-mail : le code doit être lisible,
// dictable, non falsifiable par confusion, et jamais confondu avec un e-mail.

import { describe, expect, it } from 'vitest';
import {
  ALPHABET_CODE,
  DOMAINE_INTERNE,
  LONGUEUR_CODE,
  codeDepuisIdentifiant,
  codeVersIdentifiant,
  estCode,
  estCodeSecretValide,
  estIdentifiantInterne,
  estNomValide,
  formaterCode,
  genererCode,
  identifiantAffichable,
  normaliserCode,
  normaliserNom,
  resoudreIdentifiant,
} from './codeEleve';

describe('génération du code', () => {
  it('n’utilise AUCUN caractère ambigu (I, L, O, 0, 1)', () => {
    // Un code dicté au téléphone ou recopié depuis un tableau ne doit pas
    // pouvoir devenir un autre code valide.
    for (const c of 'ILO01') expect(ALPHABET_CODE.includes(c), `« ${c} » est ambigu`).toBe(false);
    expect(ALPHABET_CODE).toHaveLength(31);
  });

  it('génère un code de la bonne longueur, dans l’alphabet, stable sur un aléa donné', () => {
    const code = genererCode(() => 0); // toujours le premier caractère
    expect(code).toBe('A'.repeat(LONGUEUR_CODE));
    const code2 = genererCode(() => 0.999999);
    expect(code2).toHaveLength(LONGUEUR_CODE);
    for (const c of code2) expect(ALPHABET_CODE).toContain(c);
  });

  it('un aléa aux bornes ne produit jamais « undefined » (défaut classique)', () => {
    for (const v of [0, 0.5, 0.9999999, 1]) {
      const code = genererCode(() => v);
      expect(code).toHaveLength(LONGUEUR_CODE);
      expect(code).not.toContain('undefined');
      for (const c of code) expect(ALPHABET_CODE).toContain(c);
    }
  });

  it('deux générations successives diffèrent (aléa réel)', () => {
    const codes = new Set(Array.from({ length: 40 }, () => genererCode()));
    expect(codes.size).toBeGreaterThan(35);
  });
});

describe('normalisation de la saisie — un élève doit pouvoir se connecter', () => {
  it('accepte minuscules, espaces, tirets et points', () => {
    for (const saisie of ['k7f2-9qx3', 'K7F2 9QX3', 'k7f2.9qx3', ' K7F29QX3 ']) {
      expect(normaliserCode(saisie), saisie).toBe('K7F29QX3');
    }
  });

  it('accepte les chiffres arabo-indiens et persans', () => {
    // Un élève qui recopie un code depuis un papier écrit en chiffres arabes.
    expect(normaliserCode('k٧f٢-٩qx٣')).toBe('K7F29QX3');
    expect(normaliserCode('k۷f۲-۹qx۳')).toBe('K7F29QX3');
  });

  it('refuse tout ce qui n’est pas un code, sans lever', () => {
    for (const invalide of ['', null, undefined, 42, {}, 'trop-court', 'K7F2-9QX3-EXTRA', 'K7F29QX!']) {
      expect(normaliserCode(invalide as unknown), String(invalide)).toBeNull();
    }
  });

  it('refuse une adresse e-mail : c’est l’AUTRE voie, pas celle-ci', () => {
    expect(estCode('eleve@gmail.com')).toBe(false);
    expect(normaliserCode('eleve@gmail.com')).toBeNull();
  });

  it('le tiret d’affichage est purement cosmétique', () => {
    expect(formaterCode('K7F29QX3')).toBe('K7F2-9QX3');
    expect(formaterCode('k7f29qx3')).toBe('K7F2-9QX3');
    // Entrée déjà normalisée par l'élève : on ne casse rien.
    expect(normaliserCode(formaterCode('K7F29QX3'))).toBe('K7F29QX3');
  });
});

describe('identifiant interne — le code rangé dans le champ e-mail existant', () => {
  it('mappe le code sur un domaine réservé, jamais routable', () => {
    expect(DOMAINE_INTERNE).toBe('eleve.local');
    expect(codeVersIdentifiant('K7F2-9QX3')).toBe('k7f29qx3@eleve.local');
  });

  it('fait l’aller-retour code → identifiant → code affichable', () => {
    const code = genererCode();
    const identifiant = codeVersIdentifiant(code);
    expect(estIdentifiantInterne(identifiant)).toBe(true);
    expect(codeDepuisIdentifiant(identifiant)).toBe(formaterCode(code));
  });

  it('distingue un compte SANS e-mail d’un compte AVEC e-mail', () => {
    expect(estIdentifiantInterne('eleve@gmail.com')).toBe(false);
    expect(codeDepuisIdentifiant('eleve@gmail.com')).toBeNull();
    // Et l'affichage ne laisse JAMAIS fuir l'adresse technique interne.
    expect(identifiantAffichable('k7f29qx3@eleve.local')).toBe('K7F2-9QX3');
    expect(identifiantAffichable('eleve@gmail.com')).toBe('eleve@gmail.com');
  });

  it('un identifiant interne ne peut pas entrer en collision avec une adresse réelle', () => {
    // `.local` est réservé (RFC 6762) : aucun domaine public ne peut le servir.
    // Le champ étant UNIQUE, l'unicité du code est garantie par la base.
    expect(codeVersIdentifiant('AAAAAAAA')).toMatch(/@eleve\.local$/);
    expect(codeVersIdentifiant('AAAAAAAA')).not.toMatch(/@(gmail|yahoo|hotmail|outlook)\./);
  });

  it('lève sur un code invalide (erreur de programmation, pas de saisie)', () => {
    expect(() => codeVersIdentifiant('pas-un-code')).toThrow(/code invalide/);
  });
});

describe('code secret à 6 chiffres', () => {
  it('accepte six chiffres, latins ou arabo-indiens', () => {
    expect(estCodeSecretValide('481902')).toBe(true);
    expect(estCodeSecretValide('٤٨١٩٠٢')).toBe(true);
    expect(estCodeSecretValide(' 481902 ')).toBe(true);
  });

  it('refuse les longueurs autres que six — dont le PIN à 4 chiffres', () => {
    // Décision assumée : 4 chiffres = 10⁴ combinaisons, trop peu même avec les
    // limiteurs. On préfère deux chiffres de plus à retenir.
    for (const v of ['1234', '12345', '1234567', '12345678', 'abcdef', '', null]) {
      expect(estCodeSecretValide(v as unknown), String(v)).toBe(false);
    }
  });

  it('refuse les suites devinables : ce sont celles qu’un camarade essaie', () => {
    for (const v of ['000000', '111111', '123456', '654321', '112233']) {
      expect(estCodeSecretValide(v), v).toBe(false);
    }
    // Mais un code chiffré ordinaire passe : on ne prétend pas mesurer l'aléa.
    expect(estCodeSecretValide('481902')).toBe(true);
  });
});

describe('resoudreIdentifiant — une seule porte pour les deux populations', () => {
  it('un code devient l’identifiant interne', () => {
    expect(resoudreIdentifiant('K7F2-9QX3')).toBe('k7f29qx3@eleve.local');
    expect(resoudreIdentifiant('k٧f٢-٩qx٣')).toBe('k7f29qx3@eleve.local');
  });

  it('une adresse e-mail passe telle quelle (comptes existants)', () => {
    expect(resoudreIdentifiant('  Eleve@Gmail.COM ')).toBe('eleve@gmail.com');
  });

  it('toute autre saisie rend une chaîne vide (→ 401, sans indice)', () => {
    for (const v of ['', null, 12, 'blabla', 'a@b', 'a@b.', '@b.c', 'pas un identifiant']) {
      expect(resoudreIdentifiant(v as unknown), String(v)).toBe('');
    }
  });
});

describe('nom d’affichage', () => {
  it('exige au moins deux caractères utiles', () => {
    expect(estNomValide('أ')).toBe(false);
    expect(estNomValide('  ')).toBe(false);
    expect(estNomValide('أحمد')).toBe(true);
    expect(estNomValide('Amine B.')).toBe(true);
  });

  it('normalise sans mutiler un nom arabe', () => {
    expect(normaliserNom('  أحمد   بن   عمر ')).toBe('أحمد بن عمر');
    expect(normaliserNom('x'.repeat(200))).toHaveLength(60);
  });
});
