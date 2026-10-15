// assainirEntrees.test.ts — le serveur définit le barème et l'horloge.
//
// Chaque test correspond à une façon concrète de falsifier les chiffres que le
// professeur lit : une note hors barème, une étape qui n'existe pas, une date
// dans six mois, un lot tronqué en silence.
import { describe, expect, it } from 'vitest';
import {
  assainirActivites,
  assainirEntrees,
  fusionnerRefus,
  horodatageCredible,
  ICM_MAX,
  LOT_MAX,
  PAYLOAD_MAX,
  TEXTE_MAX,
  TOLERANCE_FUTUR_MS,
} from './assainirEntrees';

const MAINTENANT = new Date('2026-10-14T12:00:00.000Z');

function entree(over: Record<string, unknown> = {}) {
  return {
    id: 'ent-1',
    studentId: 'eleve-1',
    verbId: 'verbe-analyse',
    theme: 'التركيب الضوئي',
    stage: 2,
    text: 'نص الإنتاج',
    icm: 75,
    criteriaSummary: [{ label: 'مقدمة', passed: true }],
    errorTags: ['absence_intro'],
    createdAt: '2026-10-13T09:00:00.000Z',
    ...over,
  };
}

describe('cas normal : rien ne doit être modifié', () => {
  it('une production normale passe intacte', () => {
    const r = assainirEntrees([entree()], MAINTENANT);
    expect(r.acceptees).toHaveLength(1);
    expect(Object.keys(r.refus)).toHaveLength(0);
    // Aucune altération silencieuse : la date de l'appareil est conservée telle
    // quelle quand elle est crédible (le travail hors ligne est légitime).
    expect(r.acceptees[0].createdAt).toBe('2026-10-13T09:00:00.000Z');
    expect(r.acceptees[0].icm).toBe(75);
    expect(r.acceptees[0].stage).toBe(2);
  });

  it('une date ANCIENNE est conservée : l’élève peut synchroniser une semaine de travail', () => {
    const r = assainirEntrees([entree({ createdAt: '2026-10-01T09:00:00.000Z' })], MAINTENANT);
    expect(r.acceptees[0].createdAt).toBe('2026-10-01T09:00:00.000Z');
    expect(r.refus.date_future_corrigee).toBeUndefined();
  });
});

describe('barème de l’ICM : l’échelle est 0-100, pas « n’importe quel nombre »', () => {
  it('refuse une note au-dessus de 100', () => {
    const r = assainirEntrees([entree({ icm: 101 })], MAINTENANT);
    expect(r.acceptees).toHaveLength(0);
    expect(r.refus.icm_hors_bareme).toBe(1);
  });

  it('refuse une note absurde (9999) — c’est le cas qui polluait la moyenne', () => {
    const r = assainirEntrees([entree({ icm: 9999 })], MAINTENANT);
    expect(r.acceptees).toHaveLength(0);
    expect(r.refus.icm_hors_bareme).toBe(1);
  });

  it('refuse une note négative', () => {
    const r = assainirEntrees([entree({ icm: -5 })], MAINTENANT);
    expect(r.acceptees).toHaveLength(0);
    expect(r.refus.icm_hors_bareme).toBe(1);
  });

  it('les bornes EXACTES passent (0 et 100 sont légitimes)', () => {
    for (const icm of [0, ICM_MAX]) {
      const r = assainirEntrees([entree({ icm })], MAINTENANT);
      expect(r.acceptees, `icm ${icm}`).toHaveLength(1);
    }
  });

  it('refuse un flottant : l’ICM est un pourcentage ENTIER', () => {
    const r = assainirEntrees([entree({ icm: 74.5 })], MAINTENANT);
    expect(r.acceptees).toHaveLength(0);
    expect(r.refus.icm_hors_bareme).toBe(1);
  });

  it('refuse une note qui n’est pas un nombre (texte, NaN, null)', () => {
    for (const icm of ['100', Number.NaN, null, undefined, { v: 100 }]) {
      const r = assainirEntrees([entree({ icm })], MAINTENANT);
      expect(r.acceptees, `icm ${String(icm)}`).toHaveLength(0);
    }
  });
});

describe('échelle des étapes : 1 à 4', () => {
  it('refuse l’étape 0, 5 ou 99', () => {
    for (const stage of [0, 5, 99, -1]) {
      const r = assainirEntrees([entree({ stage })], MAINTENANT);
      expect(r.acceptees, `stage ${stage}`).toHaveLength(0);
      expect(r.refus.stage_hors_echelle).toBe(1);
    }
  });

  it('accepte les quatre étapes réelles', () => {
    for (const stage of [1, 2, 3, 4]) {
      const r = assainirEntrees([entree({ stage })], MAINTENANT);
      expect(r.acceptees, `stage ${stage}`).toHaveLength(1);
    }
  });
});

describe('horloge : on ne supprime pas une date ancienne, on refuse une date future', () => {
  it('une date dans six mois est ramenée à l’heure du serveur', () => {
    const r = assainirEntrees([entree({ createdAt: '2027-04-14T12:00:00.000Z' })], MAINTENANT);
    expect(r.acceptees).toHaveLength(1); // le travail est réel, on ne le jette pas
    expect(r.acceptees[0].createdAt).toBe(MAINTENANT.toISOString());
    expect(r.refus.date_future_corrigee).toBe(1);
  });

  it('« actif dans 7 jours » ne peut plus être simulé', () => {
    // Sans ce garde-fou : une entrée datée de 2027 rendait l'élève « actif »
    // pour tout indicateur calculé sur les 7 derniers jours.
    const r = assainirEntrees([entree({ createdAt: '2030-01-01T00:00:00.000Z' })], MAINTENANT);
    expect(Date.parse(r.acceptees[0].createdAt)).toBeLessThanOrEqual(MAINTENANT.getTime());
  });

  it('une petite avance d’horloge est tolérée (appareil mal réglé, pas tricheur)', () => {
    const presque = new Date(MAINTENANT.getTime() + TOLERANCE_FUTUR_MS - 1000).toISOString();
    expect(horodatageCredible(presque, MAINTENANT).corrige).toBe('non');
  });

  it('une date illisible est remplacée, pas vidée', () => {
    for (const mauvais of ['pas-une-date', '', 42, null]) {
      const h = horodatageCredible(mauvais, MAINTENANT);
      expect(h.corrige).toBe('illisible');
      expect(h.valeur).toBe(MAINTENANT.toISOString());
    }
  });
});

describe('bornes de volume : plus rien n’est tronqué en silence', () => {
  it('un lot de 300 entrées est tronqué ET compté', () => {
    const lot = Array.from({ length: 300 }, (_, i) => entree({ id: `ent-${i}` }));
    const r = assainirEntrees(lot, MAINTENANT);
    expect(r.acceptees).toHaveLength(LOT_MAX);
    expect(r.refus.lot_tronque).toBe(1);
  });

  it('un texte démesuré est refusé (borné, pas coupé au milieu d’une phrase)', () => {
    const r = assainirEntrees([entree({ text: 'x'.repeat(TEXTE_MAX + 1) })], MAINTENANT);
    expect(r.acceptees).toHaveLength(0);
    expect(r.refus.texte_hors_bornes).toBe(1);
  });

  it('un texte à la borne exacte passe', () => {
    const r = assainirEntrees([entree({ text: 'x'.repeat(TEXTE_MAX) })], MAINTENANT);
    expect(r.acceptees).toHaveLength(1);
  });

  it('les étiquettes en excès sont tronquées, l’entrée survit', () => {
    const r = assainirEntrees([entree({ errorTags: Array.from({ length: 50 }, (_, i) => `t${i}`) })], MAINTENANT);
    expect(r.acceptees).toHaveLength(1);
    expect(r.acceptees[0].errorTags).toHaveLength(24);
    expect(r.refus.tags_tronques).toBe(1);
  });

  it('les étiquettes qui ne sont pas du texte sont écartées', () => {
    const r = assainirEntrees([entree({ errorTags: ['ok', 42, null, { a: 1 }, 'x'.repeat(41)] })], MAINTENANT);
    expect(r.acceptees[0].errorTags).toEqual(['ok']);
  });
});

describe('identifiants', () => {
  it('refuse un identifiant absent, vide ou énorme', () => {
    for (const id of [undefined, '', 42, null, 'x'.repeat(200)]) {
      const r = assainirEntrees([entree({ id })], MAINTENANT);
      expect(r.acceptees, `id ${String(id).slice(0, 20)}`).toHaveLength(0);
      expect(r.refus.id_invalide).toBe(1);
    }
  });

  it('refuse un identifiant contenant un caractère de contrôle', () => {
    const r = assainirEntrees([entree({ id: 'ent\u0000-1' })], MAINTENANT);
    expect(r.acceptees).toHaveLength(0);
  });

  it('refuse ce qui n’est pas un objet', () => {
    const r = assainirEntrees([null, 'texte', 42, []], MAINTENANT);
    expect(r.acceptees).toHaveLength(0);
    expect(r.refus.id_invalide).toBe(4);
  });

  it('un lot qui n’est pas un tableau ne fait rien, et ne plante pas', () => {
    for (const mauvais of [null, undefined, 'x', 42, {}]) {
      expect(assainirEntrees(mauvais, MAINTENANT).acceptees).toHaveLength(0);
    }
  });
});

describe('activités', () => {
  const activite = (over: Record<string, unknown> = {}) => ({
    id: 'act-1',
    studentId: 'eleve-1',
    type: 'quiz',
    payload: { unitId: 3, score: 8, total: 10 },
    createdAt: '2026-10-13T10:00:00.000Z',
    ...over,
  });

  it('une activité normale passe', () => {
    const r = assainirActivites([activite()], MAINTENANT);
    expect(r.acceptees).toHaveLength(1);
    expect(r.refus).toEqual({});
  });

  it('refuse un type d’activité inconnu', () => {
    const r = assainirActivites([activite({ type: 'autre' })], MAINTENANT);
    expect(r.acceptees).toHaveLength(0);
    expect(r.refus.type_inconnu).toBe(1);
  });

  it('accepte les quatre types réels', () => {
    const r = assainirActivites(
      ['quiz', 'mission', 'drill', 'production'].map((type, i) => activite({ type, id: `a${i}` })),
      MAINTENANT,
    );
    expect(r.acceptees).toHaveLength(4);
  });

  it('refuse un contenu qui n’est pas un objet', () => {
    const r = assainirActivites([activite({ payload: 'texte' })], MAINTENANT);
    expect(r.acceptees).toHaveLength(0);
    expect(r.refus.payload_invalide).toBe(1);
  });

  it('refuse un contenu trop volumineux', () => {
    const r = assainirActivites([activite({ payload: { data: 'x'.repeat(PAYLOAD_MAX) } })], MAINTENANT);
    expect(r.acceptees).toHaveLength(0);
    expect(r.refus.payload_trop_volumineux).toBe(1);
  });

  it('corrige une date future et le signale', () => {
    const r = assainirActivites([activite({ createdAt: '2030-01-01T00:00:00.000Z' })], MAINTENANT);
    expect(r.acceptees[0].createdAt).toBe(MAINTENANT.toISOString());
    expect(r.refus.date_future_corrigee).toBe(1);
  });

  it('compte plusieurs raisons dans le même lot', () => {
    const r = assainirActivites(
      [
        activite({ id: 'a1', type: 'inconnu' }),
        activite({ id: 'a2', payload: 'x' }),
        activite({ id: '', type: 'quiz' }),
        activite({ id: 'a4' }),
      ],
      MAINTENANT,
    );
    expect(r.acceptees).toHaveLength(1);
    expect(r.refus).toEqual({ type_inconnu: 1, payload_invalide: 1, id_invalide: 1 });
  });

  it('un contenu non sérialisable est refusé sans faire planter le serveur', () => {
    const cyclique: Record<string, unknown> = {};
    cyclique.soi = cyclique;
    const r = assainirActivites([activite({ payload: cyclique })], MAINTENANT);
    expect(r.acceptees).toHaveLength(0);
    expect(r.refus.payload_non_serialisable).toBe(1);
  });
});

describe('fusion des raisons de refus', () => {
  it('additionne les mêmes raisons venues des deux lots', () => {
    const f = fusionnerRefus(
      { date_future_corrigee: 1, icm_hors_bareme: 2 },
      { date_future_corrigee: 3 },
    );
    expect(f).toEqual({ date_future_corrigee: 4, icm_hors_bareme: 2 });
  });

  it('ne renvoie rien quand il n’y a aucun refus', () => {
    expect(fusionnerRefus({}, {})).toEqual({});
  });
});

describe('robustesse : un lot mixte reste utilisable', () => {
  it('garde les entrées valides et écarte les autres, sans tout rejeter', () => {
    const r = assainirEntrees(
      [
        entree({ id: 'bonne-1' }),
        entree({ id: 'fausse-note', icm: 500 }),
        entree({ id: 'bonne-2', icm: 0 }),
        entree({ id: 'fausse-etape', stage: 9 }),
        entree({ id: 'bonne-3', icm: 100 }),
      ],
      MAINTENANT,
    );
    expect(r.acceptees.map((e) => e.id)).toEqual(['bonne-1', 'bonne-2', 'bonne-3']);
    expect(r.refus).toEqual({ icm_hors_bareme: 1, stage_hors_echelle: 1 });
  });

  it('1 000 entrées valides : les 100 premières passent, le reste est compté', () => {
    const lot = Array.from({ length: 1000 }, (_, i) => entree({ id: `e${i}` }));
    const r = assainirEntrees(lot, MAINTENANT);
    expect(r.acceptees).toHaveLength(100);
    expect(r.acceptees[99].id).toBe('e99');
  });
});
