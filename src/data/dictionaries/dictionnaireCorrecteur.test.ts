// dictionnaireCorrecteur.test.ts
// Garde-fous du pont DICTIONNAIRE FINAL ↔ correcteur V1.
// Règle moteur du build : notation sur fiabilite officiel+verifie ;
// a_valider = piste + flag AMBIGUITE_LEXICALE (tolérée, JAMAIS notée).
// Verrouille : (1) mapping D1U1..D3U3 → 1..11, (2) intégrité du pool scoré,
// (3) détection par entité + étanchéité a_valider, (4) enrichissement correcteur V1.

import { describe, expect, it } from 'vitest';
import { normalizeAr } from '../../lib/validation/normalizeAr';
import {
  CODE_UNITE_VERS_ID,
  ENTITES_DICTIONNAIRE,
  entitesAmbigues,
  entitesUnite,
  evaluerEntites,
  evaluerPistes,
  formesArUnite,
  UNITES_BUILD,
} from './dictionnaireCorrecteur';
import {
  CORRECTEUR_V1_UNITES,
  evaluerReponseKeywords,
  motsClesUniteEnrichis,
} from '../../correcteurV1';

const UNITE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// ── 1. Mapping des unités ────────────────────────────────────────────────────

describe('mapping des unités du build', () => {
  it('mappe exactement D1U1..D3U3 vers les 11 ids du correcteur', () => {
    expect(Object.keys(CODE_UNITE_VERS_ID).sort()).toEqual([
      'D1U1', 'D1U2', 'D1U3', 'D1U4', 'D1U5',
      'D2U1', 'D2U2', 'D2U3', 'D3U1', 'D3U2', 'D3U3',
    ]);
    expect([...Object.values(CODE_UNITE_VERS_ID)].sort((a, b) => a - b)).toEqual(UNITE_IDS);
  });

  it('décrit les 11 unités (titre ar/fr + domaine cohérent)', () => {
    expect(Object.keys(UNITES_BUILD).length).toBe(11);
    for (const [code, u] of Object.entries(UNITES_BUILD)) {
      expect(u.titreAr.length, `titre ar ${code}`).toBeGreaterThan(0);
      expect(u.titreFr.length, `titre fr ${code}`).toBeGreaterThan(0);
      expect(['D1', 'D2', 'D3'], `domaine ${code}`).toContain(u.domaine);
    }
  });

  it('chaque unité du correcteur a au moins une entité scorée', () => {
    for (const uid of UNITE_IDS) {
      expect(entitesUnite(uid).length, `unite ${uid}`).toBeGreaterThan(0);
    }
  });
});

// ── 2. Intégrité du pool scoré ───────────────────────────────────────────────

describe('pool scoré — fiabilite officiel+verifie uniquement', () => {
  it('ne contient que des entités officiel ou verifie (règle moteur)', () => {
    for (const uid of UNITE_IDS) {
      for (const e of entitesUnite(uid)) {
        expect(['officiel', 'verifie'], `${e.id} fiabilite=${e.fiabilite}`).toContain(e.fiabilite);
      }
    }
  });

  it("n'expose aucune entité a_valider par unité (pistes transversales)", () => {
    const ambigues = new Set(entitesAmbigues().map((e) => e.id));
    expect(ambigues.size, 'le build contient des a_valider').toBeGreaterThan(0);
    for (const uid of UNITE_IDS) {
      for (const e of entitesUnite(uid)) {
        expect(ambigues.has(e.id), `${e.id} doit rester hors pool scoré`).toBe(false);
      }
    }
  });

  it('charge ~617 entités et porte au moins une source par entité (traçabilité)', () => {
    expect(ENTITES_DICTIONNAIRE.length).toBeGreaterThanOrEqual(600);
    for (const e of ENTITES_DICTIONNAIRE) {
      expect(e.nbSources, `entite ${e.id}`).toBeGreaterThan(0);
    }
  });

  it('aucune forme sans lettre ni < 3 caractères normalisés (anti-artefact OCR)', () => {
    for (const uid of UNITE_IDS) {
      for (const f of formesArUnite(uid)) {
        expect(f, `unite ${uid} forme ${f}`).toMatch(/[\u0600-\u06FFa-zA-Z]/);
        expect(normalizeAr(f).length, `unite ${uid} forme ${f}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("exclut l'artefact E0570 (« 66115 ») mais conserve sa variante CCR5", () => {
    const e0570 = ENTITES_DICTIONNAIRE.find((e) => e.id === 'E0570');
    expect(e0570).toBeDefined();
    expect(e0570!.formes).toContain('CCR5');
    expect(e0570!.formes.some((f) => /^[0-9\s]+$/.test(f))).toBe(false);
  });

  it('aucun doublon normalisé dans les formes d une unité (multi-entités)', () => {
    for (const uid of UNITE_IDS) {
      const vus = new Set<string>();
      for (const f of formesArUnite(uid)) {
        const nf = normalizeAr(f);
        expect(vus.has(nf), `unite ${uid} doublon ${f}`).toBe(false);
        vus.add(nf);
      }
    }
  });

  it('pool enrichi du correcteur = sur-ensemble strict des mots-clés L1..L6', () => {
    let ajouts = 0;
    for (const u of CORRECTEUR_V1_UNITES) {
      const enrichis = motsClesUniteEnrichis(u.uniteId);
      for (const kw of u.motsCles) {
        expect(enrichis, `unite ${u.uniteId} - ${kw}`).toContain(kw);
      }
      expect(enrichis.length, `unite ${u.uniteId}`).toBeGreaterThanOrEqual(u.motsCles.length);
      ajouts += enrichis.length - u.motsCles.length;
    }
    expect(ajouts, 'le dictionnaire doit apporter de nouvelles formes').toBeGreaterThan(100);
  });
});

// ── 3. Détection par entité + étanchéité a_valider ──────────────────────────

describe('détection par entité', () => {
  it('reconnaît une entité par sa canonique ET par chaque variante (E0036, unite 4)', () => {
    const e0036 = entitesUnite(4).find((e) => e.id === 'E0036');
    expect(e0036).toBeDefined();
    expect(e0036!.formes.length).toBeGreaterThan(1);
    for (const forme of e0036!.formes) {
      const res = evaluerEntites(`دور ${forme} في تطور الفيروس`, 4);
      expect(res.trouvees.some((t) => t.id === 'E0036'), `forme ${forme}`).toBe(true);
    }
  });

  it('détection latine insensible à la casse (ARNm → E0387, unite 1)', () => {
    const res = evaluerEntites('يرسل arnm إلى الهيولى', 1);
    expect(res.trouvees.some((t) => t.id === 'E0387')).toBe(true);
  });

  it('réponse vide ou charabia : aucune entité, aucune piste', () => {
    for (const uid of UNITE_IDS) {
      for (const rep of ['', 'xcvb qsdq 12345 !!']) {
        const res = evaluerEntites(rep, uid);
        expect(res.trouvees).toEqual([]);
        expect(res.pistesAmbigues).toEqual([]);
      }
    }
  });

  it('couvertureEntites = trouvees/total et manquantes = complément exact', () => {
    const res = evaluerEntites('', 4);
    expect(res.total).toBeGreaterThan(0);
    expect(res.couvertureEntites).toBe(0);
    const partiel = evaluerEntites('الأجسام المضادة فقط', 4);
    expect(partiel.total).toBeGreaterThan(0);
    expect(partiel.couvertureEntites).toBe(partiel.trouvees.length / partiel.total);
    expect(partiel.manquantes.length).toBe(partiel.total - partiel.trouvees.length);
  });

  it('une piste a_valider va en pistesAmbigues, JAMAIS dans trouvees (E0004)', () => {
    const e0004 = entitesAmbigues().find((e) => e.id === 'E0004');
    expect(e0004).toBeDefined();
    const res = evaluerEntites('يحدث الاختزال في الهيولى', 7);
    expect(res.pistesAmbigues.some((p) => p.id === 'E0004')).toBe(true);
    expect(res.trouvees.some((t) => t.fiabilite === 'a_valider')).toBe(false);
  });

  it('evaluerPistes est transversal et chaque piste reste a_valider', () => {
    const pistes = evaluerPistes('الاختزال وإدمان بعض المواد');
    const ids = new Set(pistes.map((p) => p.id));
    expect(ids.has('E0004')).toBe(true); // الاختزال — Réduction
    expect(ids.has('E0008')).toBe(true); // إدمان — Dépendance
    for (const p of pistes) expect(p.fiabilite).toBe('a_valider');
  });
});

// ── 4. Intégration correcteur V1 ─────────────────────────────────────────────

describe('intégration correcteur V1', () => {
  it('une variante dictionnaire est reconnue par le chemin par défaut (hors L1..L6)', () => {
    const res = evaluerReponseKeywords(
      'يتم دمج الـ ADNv ضمن ADN الخلية بواسطة الانتبغراز',
      4,
    );
    expect(res.trouves.some((t) => normalizeAr(t) === normalizeAr('الانتبغراز'))).toBe(true);
    expect(res.entitesReconnues.some((t) => t.id === 'E0036')).toBe(true);
  });

  it('le chemin à attendus explicites reste intact (pas de fuite du pool enrichi)', () => {
    const unite4 = CORRECTEUR_V1_UNITES.find((u) => u.uniteId === 4)!;
    const attendus = unite4.motsCles.slice(0, 3);
    const res = evaluerReponseKeywords('الانتبغراز الانتبغراز', 4, attendus);
    expect(res.total).toBe(attendus.length);
  });
});