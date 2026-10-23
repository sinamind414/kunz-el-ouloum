// facturation.test.ts — verrous du modèle freemium + saison.
// Ce qui est prouvé ici ne repose sur AUCUNE base réelle : horloge et
// store sont injectés (même discipline que inscriptionSansEmail.test).
import { describe, expect, it } from "vitest";
import {
  ALPHABET_CODES,
  DUREE_ESSAI_JOURS,
  PRIX_SAISON_DA,
  UNITE_GRATUITE,
  activerAbonnement,
  analyserAcces,
  appareilAutorise,
  essaiDebutEffectif,
  MAX_APPAREILS_PAR_CODE,
  finDeSaison,
  genererCodeLicence,
  normaliserCodeSaisi,
  tirerCodeAleatoire,
  type StoreFacturation,
} from "./facturation";

const LANCEMENT = "2026-10-23T00:00:00.000Z";

describe("fin de saison (frontière 30 juin)", () => {
  const cas: Array<[string, string]> = [
    // Saison scolaire en cours (septembre → juin)
    ["2026-09-15", "2027-06-30"],
    ["2026-12-25", "2027-06-30"],
    ["2027-01-10", "2027-06-30"],
    ["2027-06-30", "2027-06-30"],
    // Trêve d'été : la saison passée est fermée → saison suivante.
    ["2026-07-01", "2027-06-30"],
    ["2026-08-20", "2027-06-30"],
  ];
  for (const [achat, attendu] of cas) {
    it(`${achat} → ${attendu}`, () => {
      expect(finDeSaison(new Date(`${achat}T12:00:00Z`))).toBe(attendu);
    });
  }
});

describe("essai effectif", () => {
  it("un compte ancien ne perd jamais ses 30 jours : début = mise en service", () => {
    const debut = essaiDebutEffectif("2026-01-01T08:00:00.000Z", LANCEMENT);
    expect(debut.slice(0, 10)).toBe("2026-10-23");
  });

  it("un compte créé après la mise en service démarre à sa création", () => {
    const debut = essaiDebutEffectif("2026-11-05T09:00:00.000Z", LANCEMENT);
    expect(debut.slice(0, 10)).toBe("2026-11-05");
  });

  it("constantes du modèle (décision propriétaire)", () => {
    expect(PRIX_SAISON_DA).toBe(1200);
    expect(UNITE_GRATUITE).toBe(1);
    expect(DUREE_ESSAI_JOURS).toBe(30);
  });
});

describe("analyserAcces — hiérarchie abonnement > essai > gratuit", () => {
  it("compte neuf : essai de 30 jours", () => {
    const etat = analyserAcces({
      createdAt: "2026-11-01T10:00:00.000Z",
      lancement: LANCEMENT,
      maintenant: new Date("2026-11-02T00:00:00.000Z"),
    });
    expect(etat.statut).toBe("essai");
    expect(etat.joursRestants).toBe(30);
    expect(etat.expireLe).toBe("2026-12-01");
  });

  it("essai expiré → gratuit (unité 1 seulement)", () => {
    const etat = analyserAcces({
      createdAt: "2026-11-01T10:00:00.000Z",
      lancement: LANCEMENT,
      maintenant: new Date("2026-12-10T00:00:00.000Z"),
    });
    expect(etat.statut).toBe("gratuit");
    expect(etat.expireLe).toBeNull();
    expect(etat.joursRestants).toBe(0);
  });

  it("abonnement actif l'emporte, même hors fenêtre d'essai", () => {
    const etat = analyserAcces({
      createdAt: "2026-01-01T10:00:00.000Z",
      lancement: LANCEMENT,
      abonnementExpireLe: "2027-06-30",
      maintenant: new Date("2027-03-15T00:00:00.000Z"),
    });
    expect(etat.statut).toBe("abonnement");
    expect(etat.expireLe).toBe("2027-06-30");
    expect(etat.joursRestants).toBeGreaterThan(90);
  });

  it("abonnement périmé (30 juin passé) → retombe sur gratuit/essai échu", () => {
    const etat = analyserAcces({
      createdAt: "2026-01-01T10:00:00.000Z",
      lancement: LANCEMENT,
      abonnementExpireLe: "2027-06-30",
      maintenant: new Date("2027-07-05T00:00:00.000Z"),
    });
    expect(etat.statut).toBe("gratuit");
  });
});

describe("codes d'activation", () => {
  it("alphabet sans ambiguïtés (pas de I, L, O, 0, 1)", () => {
    expect(ALPHABET_CODES).not.toMatch(/[ILO01]/);
    // 26 lettres - I/L/O = 23, chiffres 2-9 = 8 → 31 caractères sûrs.
    expect(ALPHABET_CODES).toHaveLength(31);
  });

  it("génère le format KUNZ-XXXX-XXXX et refuse l'hors-alphabet", () => {
    expect(genererCodeLicence("AB2C9XYZ")).toBe("KUNZ-AB2C-9XYZ");
    expect(() => genererCodeLicence("A0CDEFGH")).toThrow();
    expect(() => genererCodeLicence("ABC")).toThrow();
  });

  it("tirage aléatoire reste dans l'alphabet et à la bonne longueur", () => {
    const code = tirerCodeAleatoire(ALPHABET_CODES, 8);
    expect(code).toHaveLength(8);
    for (const c of code) expect(ALPHABET_CODES.includes(c)).toBe(true);
  });

  it("normalisation : casse, espaces, tirets, préfixe facultatif", () => {
    expect(normaliserCodeSaisi(" kunz-ab2c-9xyz ")).toBe("KUNZ-AB2C-9XYZ");
    expect(normaliserCodeSaisi("AB2C9XYZ")).toBe("KUNZ-AB2C-9XYZ");
    expect(normaliserCodeSaisi("AB2C\u00A09XYZ")).toBe("KUNZ-AB2C-9XYZ"); // espace insécable du copier-coller : récupéré
    expect(normaliserCodeSaisi("KUNZ-AB0C-9XYZ")).toBeNull(); // 0 hors alphabet
    expect(normaliserCodeSaisi(undefined)).toBeNull();
    expect(normaliserCodeSaisi("court")).toBeNull();
  });
});

describe("activation par code (store injecté)", () => {
  function storeAvec(lignes: Map<string, { utilisePar: string | null; appareils: string[] }>): {
    store: StoreFacturation;
    abonnements: Map<string, string>;
  } {
    const abonnements = new Map<string, string>();
    const store: StoreFacturation = {
      trouverLicence: (code) =>
        lignes.has(code)
          ? { code, utilisePar: lignes.get(code)!.utilisePar, expireLe: null, appareils: lignes.get(code)!.appareils }
          : null,
      marquerLicenceUtilisee: (code, studentId) => {
        const l = lignes.get(code);
        if (!l || (l.utilisePar && l.utilisePar !== studentId)) return false;
        l.utilisePar = studentId;
        return true;
      },
      definirAbonnement: (studentId, expireLe) => {
        abonnements.set(studentId, expireLe);
      },
      ajouterAppareilSiPlace: (code, eleveId, appareilId) => {
        const l = lignes.get(code);
        if (!l || l.utilisePar !== eleveId) return false;
        if (l.appareils.includes(appareilId)) return true;
        if (l.appareils.length >= MAX_APPAREILS_PAR_CODE) return false;
        l.appareils.push(appareilId);
        return true;
      },
      licenceDe: (studentId) => {
        for (const [code, l] of lignes) {
          if (l.utilisePar === studentId) return { code, appareils: l.appareils };
        }
        return null;
      },
    };
    return { store, abonnements };
  }

  it("code valable → abonnement jusqu'au 30 juin + appareil lié", async () => {
    const lignes = new Map([["KUNZ-AB2C-9XYZ", { utilisePar: null, appareils: [] }]]);
    const { store, abonnements } = storeAvec(lignes);
    const r = await activerAbonnement(store, {
      eleveId: "stu_1",
      code: " kunz-ab2c-9xyz ",
      appareilId: "appareil-AAAA1111BBBB",
      maintenant: new Date("2026-11-20T00:00:00.000Z"),
    });
    expect(r).toEqual({ ok: true, statut: "abonnement", expireLe: "2027-06-30" });
    expect(abonnements.get("stu_1")).toBe("2027-06-30");
    expect(lignes.get("KUNZ-AB2C-9XYZ")?.utilisePar).toBe("stu_1");
    expect(lignes.get("KUNZ-AB2C-9XYZ")?.appareils).toEqual(["appareil-AAAA1111BBBB"]);
  });

  it("code inconnu → 404 code_inconnu", async () => {
    const { store } = storeAvec(new Map());
    const r = await activerAbonnement(store, { eleveId: "stu_1", code: "AB2C9XYZ" });
    expect(r).toEqual({ ok: false, statut: 404, erreur: "code_inconnu" });
  });

  it("code déjà consommé par un AUTRE élève → 409 code_deja_utilise", async () => {
    const lignes = new Map([["KUNZ-AB2C-9XYZ", { utilisePar: "stu_autre", appareils: [] }]]);
    const { store, abonnements } = storeAvec(lignes);
    const r = await activerAbonnement(store, { eleveId: "stu_1", code: "KUNZ-AB2C-9XYZ" });
    expect(r).toEqual({ ok: false, statut: 409, erreur: "code_deja_utilise" });
    expect(abonnements.size).toBe(0);
  });

  it("UN seul appareil passe, le SECOND est refusé (anti-partage strict)", async () => {
    const lignes = new Map([["KUNZ-AB2C-9XYZ", { utilisePar: "stu_1", appareils: [] }]]);
    const { store } = storeAvec(lignes);
    // 1er appareil → accepté
    const r1 = await activerAbonnement(store, { eleveId: "stu_1", code: "KUNZ-AB2C-9XYZ", appareilId: "appareil-1" });
    expect(r1).toEqual({ ok: true, statut: "abonnement", expireLe: "2027-06-30" });
    // 2e appareil → refusé (WhatsApp → nouveau code)
    const r2 = await activerAbonnement(store, { eleveId: "stu_1", code: "KUNZ-AB2C-9XYZ", appareilId: "appareil-2" });
    expect(r2).toEqual({ ok: false, statut: 409, erreur: "code_appareils_pleins" });
    // le MÊME appareil rejoue → idempotent (jamais pénalisé)
    const r1bis = await activerAbonnement(store, { eleveId: "stu_1", code: "KUNZ-AB2C-9XYZ", appareilId: "appareil-1" });
    expect(r1bis).toEqual({ ok: true, statut: "abonnement", expireLe: "2027-06-30" });
  });

  it("appareilAutorise : licence non liée = permissive, licence liée = stricte", () => {
    // Achat ancien sans empreinte : on ne punit pas.
    expect(appareilAutorise(null, null)).toBe(true);
    expect(appareilAutorise({ appareils: [] }, "appareil-9")).toBe(true);
    // Licence liée : seul un appareil attaché passe.
    expect(appareilAutorise({ appareils: ["appareil-1"] }, "appareil-1")).toBe(true);
    expect(appareilAutorise({ appareils: ["appareil-1"] }, "appareil-2")).toBe(false);
    // Client qui ne transmet pas son empreinte sur une licence liée : refus.
    expect(appareilAutorise({ appareils: ["appareil-1"] }, null)).toBe(false);
  });

  it("réactivation par le MÊME élève → idempotente, toujours succès", async () => {
    const lignes = new Map([["KUNZ-AB2C-9XYZ", { utilisePar: "stu_1", appareils: [] }]]);
    const { store, abonnements } = storeAvec(lignes);
    const r = await activerAbonnement(store, { eleveId: "stu_1", code: "KUNZ-AB2C-9XYZ" });
    expect(r).toEqual({ ok: true, statut: "abonnement", expireLe: "2027-06-30" });
    expect(abonnements.get("stu_1")).toBe("2027-06-30");
  });

  it("saisie irréparable → 400 invalid_code_format (jamais de crash)", async () => {
    const { store } = storeAvec(new Map());
    for (const saisie of ["", "ZZZZ", "AB2C-9XY", 42, null]) {
      const r = await activerAbonnement(store, { eleveId: "stu_1", code: saisie as never });
      expect(r).toEqual({ ok: false, statut: 400, erreur: "invalid_code_format" });
    }
  });
});
