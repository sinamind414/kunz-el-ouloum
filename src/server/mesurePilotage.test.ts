// mesurePilotage.test.ts — « combien s'inscrivent, combien abandonnent » sans
// collecter une seule donnée de plus. Fonction pure, horloge injectée.
import { describe, expect, it } from 'vitest';
import { type LignePilotage, mediane, mesurerPilotage } from './mesurePilotage';

const MAINTENANT = Date.parse('2026-10-14T12:00:00.000Z');
const h = (heures: number) => new Date(MAINTENANT + heures * 3600_000).toISOString();
/** Inscription il y a `jours`, trace d'activité il y a `traceHeures`. */
const eleve = (
  jours: number,
  surcharge: Partial<LignePilotage> = {},
): LignePilotage => ({
  createdAt: h(-24 * jours),
  productions: 0,
  activities: [],
  actif7j: false,
  actif30j: false,
  ...surcharge,
});

describe('mediane', () => {
  it('rend la valeur centrale, ou la moyenne des deux centrales', () => {
    expect(mediane([3, 1, 2])).toBe(2);
    expect(mediane([1, 2, 3, 4])).toBe(2.5);
    expect(mediane([42])).toBe(42);
  });

  it('ne invente pas de médiane sans effectif', () => {
    // Aucune donnée → null, jamais 0 : 0 serait une mesure, pas une absence.
    expect(mediane([])).toBeNull();
  });
});

describe('mesurerPilotage — ce que le serveur sait déjà', () => {
  it('compte les inscrits et ceux de la semaine', () => {
    const m = mesurerPilotage(
      [eleve(1), eleve(3), eleve(6.9), eleve(8), eleve(60)],
      MAINTENANT,
    );
    expect(m.inscrits).toBe(5);
    expect(m.inscriptions7j).toBe(3);
  });

  it('distingue un élève qui n’a RIEN envoyé d’un élève actif', () => {
    const m = mesurerPilotage(
      [
        eleve(30), // inscrit, jamais rien produit
        eleve(30, { activities: [{ createdAt: h(-24 * 20) }] }), // un quiz suffit
        eleve(30, { productions: 2, premiereProduction: h(-24 * 25) }),
      ],
      MAINTENANT,
    );
    expect(m.jamaisActifs).toBe(1);
    expect(m.anciensSansTrace).toBe(1);
  });

  it('ne compte pas comme « jamais actif » un élève qui n’a que des produits sans date', () => {
    // Cas limites : la production existe (compteur > 0) même si son horodatage
    // a disparu — on ne le classe pas parmi les abandons.
    const m = mesurerPilotage([eleve(10, { productions: 1, premiereProduction: null })], MAINTENANT);
    expect(m.jamaisActifs).toBe(0);
  });

  it('un inscrit d’hier sans trace n’est PAS un ancien abandon (fenêtre de 7 jours)', () => {
    const m = mesurerPilotage([eleve(1), eleve(2)], MAINTENANT);
    expect(m.jamaisActifs).toBe(2);
    expect(m.anciensSansTrace).toBe(0); // trop tôt pour juger
  });

  it('calcule le délai médian inscription → première trace', () => {
    // 6 h, 24 h, 48 h  → médiane 24 h.
    const m = mesurerPilotage(
      [
        eleve(10, { activities: [{ createdAt: h(-24 * 10 + 6) }] }),
        eleve(10, { activities: [{ createdAt: h(-24 * 10 + 24) }] }),
        eleve(10, { premiereProduction: h(-24 * 10 + 48) }),
      ],
      MAINTENANT,
    );
    expect(m.retardPremiereTraceH).toBe(24);
    expect(m.echantillonRetard).toBe(3);
  });

  it('prend la PLUS ANCIENNE trace, pas la plus récente', () => {
    const m = mesurerPilotage(
      [
        eleve(10, {
          activities: [{ createdAt: h(-24 * 2) }, { createdAt: h(-24 * 10 + 5) }],
          premiereProduction: h(-24 * 9),
        }),
      ],
      MAINTENANT,
    );
    expect(m.retardPremiereTraceH).toBe(5); // 5 h après l'inscription
  });

  it('n’expose pas de médiane sans échantillon', () => {
    const m = mesurerPilotage([eleve(30), eleve(30)], MAINTENANT);
    expect(m.retardPremiereTraceH).toBeNull();
    expect(m.echantillonRetard).toBe(0);
  });

  it('borne à 0 un délai négatif (horloge d’appareil en retard)', () => {
    // L'activité semble antérieure à l'inscription : on ne fausse pas la médiane.
    const m = mesurerPilotage(
      [{ createdAt: h(-10), productions: 0, activities: [{ createdAt: h(-24 * 2) }], actif7j: true, actif30j: true }],
      MAINTENANT,
    );
    expect(m.retardPremiereTraceH).toBe(0);
  });

  it('ignore une date illisible au lieu de compter NaN', () => {
    const m = mesurerPilotage(
      [eleve(30, { createdAt: 'pas-une-date' }), eleve(30, { activities: [{ createdAt: 'n/a' }] })],
      MAINTENANT,
    );
    expect(m.inscriptions7j).toBe(0);
    expect(m.retardPremiereTraceH).toBeNull();
    expect(m.echantillonRetard).toBe(0);
    expect(m.jamaisActifs).toBe(2);
  });

  it('recopie les actifs 7j / 30j sans les recalculer (source unique)', () => {
    const m = mesurerPilotage(
      [
        eleve(3, { actif7j: true, actif30j: true, activities: [{ createdAt: h(-2) }] }),
        eleve(20, { actif30j: true, activities: [{ createdAt: h(-24 * 10) }] }),
        eleve(40),
      ],
      MAINTENANT,
    );
    expect(m.actifs7j).toBe(1);
    expect(m.actifs30j).toBe(2);
  });

  it('sur une base vide, tout est à zéro et rien ne plante', () => {
    const m = mesurerPilotage([], MAINTENANT);
    expect(m).toEqual({
      inscrits: 0,
      inscriptions7j: 0,
      jamaisActifs: 0,
      anciensSansTrace: 0,
      actifs7j: 0,
      actifs30j: 0,
      retardPremiereTraceH: null,
      echantillonRetard: 0,
    });
  });

  it('reste cohérent sur 1 000 élèves (pas de comptage double)', () => {
    const lignes: LignePilotage[] = [];
    for (let i = 0; i < 1000; i += 1) {
      const actif = i % 4 === 0;
      lignes.push(
        eleve(i % 30, {
          activities: actif ? [{ createdAt: h(-1) }] : [],
          actif7j: actif,
          actif30j: actif,
        }),
      );
    }
    const m = mesurerPilotage(lignes, MAINTENANT);
    expect(m.inscrits).toBe(1000);
    expect(m.actifs7j).toBe(250);
    expect(m.jamaisActifs).toBe(750);
    expect(m.jamaisActifs + m.actifs7j).toBe(1000);
  });
});
