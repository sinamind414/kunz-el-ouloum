// consigneEntreeTraining.test.ts — LE CAPITAINE DÉCIDE, et il sait se taire.
//
// Patch « consigne d'entrée » (2026-11-04). Ces tests sont COMPORTEMENTAUX :
// ils appellent la règle, ils ne lisent pas son code source. Ils verrouillent
// surtout les SILENCES — c'est là que se joue l'honnêteté du guide (pas de
// recommandation fabriquée avec des données absentes).

import { describe, expect, it } from 'vitest';
import { assemblerEtatEleve, type EtatEleve } from '../../lib/etatEleve';
import { consigneEntreeTraining, DUREE_GESTE_ENTREE_MIN } from '../../lib/invitationCapitaine';
import { TRAINING_ENTRIES } from '../../data/trainingHub';

const MAINTENANT = new Date(2026, 10, 4, 10, 0, 0); // 4 nov 2026, 10 h locales

interface Options {
  chargee?: boolean;
  epreuve?: boolean;
  bandeauPremiereVisite?: boolean;
  unitePrioritaire?: string | null;
  faibles?: string[];
  erreurs?: number;
  horizon?: { joursAvantBac: number | null; dateProvisoire: boolean };
}

/** Un VRAI état assemblé par le module du Capitaine, jamais un objet deviné. */
function etatDeTest(o: Options = {}): EtatEleve {
  const base = assemblerEtatEleve({
    daily: undefined,
    maintenant: MAINTENANT,
    rubrique: 'training',
    rubriqueAUnConseil: true,
    // Rubrique déjà vue ⇒ le bandeau de 1ʳᵉ visite s'est tu : une seule voix.
    rubriquesDejaVues: o.bandeauPremiereVisite ? [] : ['training'],
    epreuveEnCours: o.epreuve === true,
    competence: o.chargee === false
      ? null
      : {
          verdicts: {},
          faibles: o.faibles ?? [],
          unitePrioritaire: o.unitePrioritaire ?? null,
        },
    erreurs: {
      total: o.erreurs ?? 0,
      dominante: null,
      capital: { fermees: 0, rouvertes: 0, total: 0 },
    },
  });
  return o.horizon ? { ...base, horizon: o.horizon } : base;
}

describe('consigne d entrée — les silences du Capitaine', () => {
  it('état pas encore déposé ⇒ null, aucune recommandation inventée', () => {
    expect(consigneEntreeTraining(null, 3)).toBeNull();
  });

  it('compétence non chargée ⇒ null (pas de verdicts, pas de module deviné)', () => {
    expect(consigneEntreeTraining(etatDeTest({ chargee: false }), 3)).toBeNull();
  });

  it('épreuve en cours ⇒ silence absolu', () => {
    expect(consigneEntreeTraining(etatDeTest({ epreuve: true }), 3)).toBeNull();
  });

  it('1ʳᵉ visite AVEC état ⇒ la prescription nomme quand même le module', () => {
    // Le bandeau d'accueil donne le principe mais ne nomme AUCUNE carte : le
    // muter ici aurait laissé « par quoi je commence ? » sans réponse au moment
    // où l'élève en a le plus besoin. Un seul décideur, donc pas de 2ᵉ guide.
    const c = consigneEntreeTraining(etatDeTest({ bandeauPremiereVisite: true }), 3);
    expect(c).not.toBeNull();
    expect(c!.tab).toBe('situations');
  });
});

describe('consigne d entrée — la décision pédagogique', () => {
  it('zéro unité complète ⇒ UN geste guidé (workshop), pas un sند à froid', () => {
    const c = consigneEntreeTraining(etatDeTest(), 0);
    expect(c).not.toBeNull();
    expect(c!.tab).toBe('workshop');
    expect(c!.gesteAr.length).toBeGreaterThan(3);
  });

  it('unité faible ⇒ situations, et le « pourquoi » nomme la VRAIE unité', () => {
    const c = consigneEntreeTraining(etatDeTest({ unitePrioritaire: 'التركيب الضوئي' }), 2);
    expect(c!.tab).toBe('situations');
    expect(c!.pourquoiAr).toContain('التركيب الضوئي');
    expect(c!.gesteAr).toContain('التركيب الضوئي');
  });

  it('deux erreurs au دفتر sans unité nommée ⇒ situations, sans ancrage inventé', () => {
    const c = consigneEntreeTraining(etatDeTest({ erreurs: 2 }), 2);
    expect(c!.tab).toBe('situations');
    expect(c!.pourquoiAr).not.toContain('undefined');
    expect(c!.gesteAr).not.toContain('undefined');
  });

  it('date officielle ≤ 30 jours et ≥ 2 unités ⇒ examens (الورقة والساعة)', () => {
    const c = consigneEntreeTraining(
      etatDeTest({ horizon: { joursAvantBac: 12, dateProvisoire: false } }),
      2,
    );
    expect(c!.tab).toBe('examens');
    expect(c!.pourquoiAr).toContain('12');
  });

  it('date PROVISOIRE ⇒ aucun décompte annoncé, la branche sprint ne ment pas', () => {
    const c = consigneEntreeTraining(
      etatDeTest({ horizon: { joursAvantBac: 12, dateProvisoire: true } }),
      4,
    );
    expect(c!.tab).not.toBe('examens');
    expect(c!.pourquoiAr).not.toContain('بقي 12');
  });

  it('élève solide ⇒ situations, cœur du BAC (jamais une porte QCM)', () => {
    const c = consigneEntreeTraining(etatDeTest(), 3);
    expect(c!.tab).toBe('situations');
    expect(c!.gesteAr).toContain('صحّح');
  });

  it('un seul exercice, 10 minutes, correction incluse dans la consigne', () => {
    const c = consigneEntreeTraining(etatDeTest(), 3)!;
    expect(c.dureeMin).toBe(DUREE_GESTE_ENTREE_MIN);
    expect(c.dureeMin).toBeGreaterThan(0);
    expect(c.pourquoiAr.trim().length).toBeGreaterThan(10);
    expect(c.gesteAr.length).toBeLessThan(90);
  });
});

describe('consigne d entrée — elle ne casse aucune porte', () => {
  it('tous les états possibles ne désignent QUE des cartes existantes et libres', () => {
    const etats: [EtatEleve, number][] = [
      [etatDeTest(), 0],
      [etatDeTest(), 1],
      [etatDeTest(), 2],
      [etatDeTest(), 5],
      [etatDeTest({ unitePrioritaire: 'المناعة' }), 3],
      [etatDeTest({ erreurs: 4 }), 3],
      [etatDeTest({ horizon: { joursAvantBac: 9, dateProvisoire: false } }), 3],
    ];
    for (const [etat, unites] of etats) {
      const c = consigneEntreeTraining(etat, unites)!;
      const carte = TRAINING_ENTRIES.find((e) => e.tab === c.tab);
      expect(carte, `onglet ${c.tab} introuvable dans le hub`).toBeTruthy();
      expect(carte!.deverrouApresUnites, `${c.tab} ne doit jamais être cadenassé`).toBeUndefined();
    }
    expect(new Set(etats.map(([e, u]) => consigneEntreeTraining(e, u)!.tab)).size).toBeGreaterThan(1);
  });

  it('progression négative ou non entière ⇒ traitée comme zéro, sans exception', () => {
    expect(consigneEntreeTraining(etatDeTest(), -4)!.tab).toBe('workshop');
    expect(consigneEntreeTraining(etatDeTest(), Number.NaN)!.tab).toBe('workshop');
  });

  it('pureté : mêmes entrées ⇒ même décision, et AUCUNE écriture de stockage', () => {
    const avant = localStorage.length;
    const a = consigneEntreeTraining(etatDeTest({ unitePrioritaire: 'الوراثة' }), 2);
    const b = consigneEntreeTraining(etatDeTest({ unitePrioritaire: 'الوراثة' }), 2);
    expect(a).toEqual(b);
    expect(localStorage.length).toBe(avant);
  });
});
