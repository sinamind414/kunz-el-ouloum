// marque.test.ts — le marquage doit être STABLE, NON IDENTIFIANT, et HONNÊTE.
//
// Trois propriétés qui comptent :
//   1. stabilité : le même élève porte la même marque sur son téléphone et dans
//      l'export du professeur. Sinon la correspondance est impossible ;
//   2. non-identifiance : la marque ne contient ni le nom, ni l'e-mail, ni le
//      code de connexion. Un document qui fuit ne doit pas livrer un identifiant ;
//   3. honnêteté : un invité n'a PAS de marque nominative — on l'écrit au lieu
//      de laisser croire à un marquage qui n'existe pas.
import { describe, expect, it } from 'vitest';
import {
  apposerMarqueCanvas,
  estTraceable,
  ligneMarque,
  ligneMarqueCourte,
  marqueDepuisIdentite,
  PREFIXE_MARQUE,
  type ContexteDessin,
} from '../marque';
import { IDENTITE_INVITE } from '../activityLog';

describe('stabilité de la marque', () => {
  it('le même identifiant donne TOUJOURS la même marque', () => {
    const id = 'eleve-7f3a91c4-2b1e';
    const m1 = marqueDepuisIdentite(id);
    const m2 = marqueDepuisIdentite(id);
    expect(m1).toBe(m2);
    expect(m1).toMatch(/^KZ-[0-9A-F]{6}$/);
  });

  it('deux élèves différents ont (presque toujours) deux marques différentes', () => {
    const marques = new Set(
      Array.from({ length: 500 }, (_, i) => marqueDepuisIdentite(`eleve-${i}`)),
    );
    // 500 identifiants sur 16,7 M de combinaisons : les collisions doivent être
    // exceptionnelles. On exige au moins 99 % de marques distinctes.
    expect(marques.size).toBeGreaterThan(495);
  });

  it('deux identifiants qui se ressemblent ne donnent pas la même marque', () => {
    expect(marqueDepuisIdentite('eleve-1')).not.toBe(marqueDepuisIdentite('eleve-2'));
    expect(marqueDepuisIdentite('a')).not.toBe(marqueDepuisIdentite('A'));
  });

  it('la marque ne change pas selon la casse du préfixe interne (format figé)', () => {
    // Verrou de format : si quelqu'un change le préfixe ou la longueur sans y
    // penser, les marques déjà imprimées deviennent introuvables dans l'export.
    const m = marqueDepuisIdentite('x')!;
    expect(m.startsWith(`${PREFIXE_MARQUE}-`)).toBe(true);
    expect(m.length).toBe(PREFIXE_MARQUE.length + 7);
  });
});

describe('non-identifiance : aucun identifiant dans le document', () => {
  it('la marque ne contient NI le nom, NI l’e-mail, NI le code de connexion', () => {
    const marque = marqueDepuisIdentite('AB12-CD34@eleve.local')!;
    expect(marque).not.toContain('AB12');
    expect(marque).not.toContain('CD34');
    expect(marque).not.toContain('eleve.local');
    expect(marque).not.toContain('@');
  });

  it('la ligne de marque ne divulgue pas le code non plus', () => {
    // Cas réel : l'identité interne d'un compte sans e-mail est le code suivi de
    // @eleve.local. Rien de tout cela ne doit apparaître sur un document partagé.
    const ligne = ligneMarque('AB12-CD34@eleve.local');
    expect(ligne).not.toContain('AB12-CD34');
    expect(ligne).not.toContain('eleve.local');
    expect(ligne).toContain('KZ-');
  });

  it('n’est pas un code de connexion valide (forme différente)', () => {
    const marque = marqueDepuisIdentite('AB12-CD34@eleve.local')!;
    // Le format d'un code élève est XXXX-XXXX (8 caractères alphanumériques).
    expect(marque.replace('KZ-', '')).not.toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(marque).not.toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });
});

describe('honnêteté : invité et professeur ne reçoivent pas de marque d’élève', () => {
  it('le mode invité n’est pas traçable', () => {
    expect(estTraceable(IDENTITE_INVITE)).toBe(false);
    expect(marqueDepuisIdentite(IDENTITE_INVITE)).toBeNull();
  });

  it('un jeton d’enseignant (identité « compte ») n’est pas traçable non plus', () => {
    expect(estTraceable('compte')).toBe(false);
    expect(marqueDepuisIdentite('compte')).toBeNull();
  });

  it('une identité vide ou absente n’est pas traçable', () => {
    expect(estTraceable('')).toBe(false);
    expect(estTraceable(null)).toBe(false);
    expect(estTraceable(undefined)).toBe(false);
    expect(marqueDepuisIdentite('')).toBeNull();
  });

  it('la ligne d’un invité DIT qu’elle n’est pas traçable (pas de faux marquage)', () => {
    const ligne = ligneMarque(IDENTITE_INVITE);
    expect(ligne).not.toContain('KZ-');
    expect(ligne).toContain('غير قابلة للتتبع');
    expect(ligne).toContain('non traçable');
  });

  it('la ligne d’un élève identifié porte la marque et ne parle pas d’invité', () => {
    const ligne = ligneMarque('eleve-42');
    expect(ligne).toContain(marqueDepuisIdentite('eleve-42')!);
    expect(ligne).not.toContain('للزائر');
  });
});

describe('version courte (pieds de page étroits)', () => {
  it('contient la marque pour un élève identifié', () => {
    expect(ligneMarqueCourte('eleve-42')).toContain(marqueDepuisIdentite('eleve-42')!);
  });

  it('reste courte', () => {
    expect(ligneMarqueCourte('eleve-42').length).toBeLessThan(40);
    expect(ligneMarqueCourte(IDENTITE_INVITE).length).toBeLessThan(40);
  });

  it('reste honnête pour un invité', () => {
    expect(ligneMarqueCourte(IDENTITE_INVITE)).not.toContain('KZ-');
    // Sur une image, il n'y a pas de place pour une phrase : « زائر » seul
    // laisserait croire que la copie a été marquée. On l'écrit.
    expect(ligneMarqueCourte(IDENTITE_INVITE)).toContain('غير قابلة للتتبع');
  });
});

describe('apposition dans une image : le cas réel du partage WhatsApp', () => {
  function fauxContexte() {
    const appels: Array<{ texte: string; x: number; y: number }> = [];
    const ctx: ContexteDessin & { appels: typeof appels } = {
      fillStyle: '',
      font: '',
      textAlign: '',
      appels,
      fillText(texte, x, y) {
        appels.push({ texte, x, y });
      },
    };
    return ctx;
  }

  it('écrit la marque en bas à droite, dans la zone conservée par une capture', () => {
    const ctx = fauxContexte();
    const ok = apposerMarqueCanvas(ctx, 'eleve-42', { largeur: 800, hauteur: 1000 });
    expect(ok).toBe(true);
    expect(ctx.appels.length).toBe(1);
    const { texte, x, y } = ctx.appels[0];
    expect(texte).toContain(marqueDepuisIdentite('eleve-42')!);
    expect(x).toBeLessThan(800);
    expect(x).toBeGreaterThan(600); // à droite
    expect(y).toBeLessThan(1000);
    expect(y).toBeGreaterThan(950); // en bas
  });

  it('le marqueur est DISCRET (plus petit que le texte du document)', () => {
    const ctx = fauxContexte();
    apposerMarqueCanvas(ctx, 'eleve-42', { largeur: 800, hauteur: 1000, taillePolice: 20 });
    const taille = Number(/(\d+)px/.exec(ctx.font)?.[1]);
    expect(taille).toBeLessThan(20);
    expect(taille).toBeGreaterThanOrEqual(9); // mais lisible
  });

  it('n’écrit PAS de fausse marque pour un invité', () => {
    const ctx = fauxContexte();
    const ok = apposerMarqueCanvas(ctx, IDENTITE_INVITE, { largeur: 800, hauteur: 1000 });
    expect(ok).toBe(false);
    // Le texte écrit dit explicitement que la copie n'est pas traçable.
    expect(ctx.appels[0].texte).toContain('غير قابلة للتتبع');
  });

  it('respecte une couleur fournie, et en pose une par défaut sinon', () => {
    const a = fauxContexte();
    apposerMarqueCanvas(a, 'eleve-1', { largeur: 100, hauteur: 100, couleur: '#ff0000' });
    expect(a.fillStyle).toBe('#ff0000');
    const b = fauxContexte();
    apposerMarqueCanvas(b, 'eleve-1', { largeur: 100, hauteur: 100 });
    expect(b.fillStyle).not.toBe('');
  });

  it('ne plante pas si le contexte n’a ni save ni restore', () => {
    const ctx = fauxContexte();
    expect(() => apposerMarqueCanvas(ctx, 'eleve-1', { largeur: 10, hauteur: 10 })).not.toThrow();
  });
});
