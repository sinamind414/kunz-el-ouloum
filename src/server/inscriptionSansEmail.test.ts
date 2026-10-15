// ============================================================
// inscriptionSansEmail.test.ts — le parcours « sans e-mail »
// testé de BOUT EN BOUT, avec un store en mémoire et bcrypt réel.
//
// Ce que ce fichier prouve, et qu'aucun test de lecture de source
// ne prouve : un élève sans adresse e-mail peut s'inscrire, recevoir
// un code, se reconnecter avec ce code (même mal saisi), et son
// adresse technique interne ne sort JAMAIS de l'API.
// ============================================================
import { describe, expect, it } from 'vitest';
import bcrypt from 'bcryptjs';
import {
  type EleveStocke,
  type OutilsAuth,
  connecterParIdentifiant,
  donneesPubliques,
  inscrireSansEmail,
  validerNouveauSecret,
} from './inscriptionSansEmail';
import { DOMAINE_INTERNE, estCode, estIdentifiantInterne, normaliserCode } from './codeEleve';

/** Store en mémoire qui imite le contrat du store réel (SQLite/PG/dégradé). */
function fauxStore() {
  const parEmail = new Map<string, EleveStocke>();
  let lectures = 0;
  return {
    lectures: () => lectures,
    taille: () => parEmail.size,
    eleve: (email: string) => parEmail.get(email),
    inscriptions: [] as string[],
    findStudentByEmail(email: string) {
      lectures += 1;
      return parEmail.get(email) ?? null;
    },
    createStudent(id: string, email: string, passwordHash: string, name: string) {
      if (parEmail.has(email)) {
        const e: any = new Error('email_exists');
        e.statusCode = 409;
        throw e;
      }
      const eleve: EleveStocke = { id, email, passwordHash, name };
      parEmail.set(email, eleve);
      this.inscriptions.push(email);
      return eleve;
    },
  };
}

/** Outils réels (bcrypt à coût minimal pour la vitesse) + doublures explicites. */
function outils(surcharge: Partial<OutilsAuth> = {}): OutilsAuth {
  return {
    hacher: (mdp) => bcrypt.hash(mdp, 4),
    verifier: (mdp, hash) => bcrypt.compare(mdp, hash),
    signer: ({ studentId }) => `jeton.${studentId}`,
    idEleve: (() => {
      let n = 0;
      return () => `stu_${(n += 1)}`;
    })(),
    ...surcharge,
  };
}

const INSCRIPTION = { name: 'أحمد بن عمر', pin: '481902' };

describe('inscription sans adresse e-mail', () => {
  it('crée le compte, renvoie 201, un code dictable et un jeton', async () => {
    const store = fauxStore();
    const r = await inscrireSansEmail(store, INSCRIPTION, outils());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.statut).toBe(201);
    expect(estCode(r.eleve.code)).toBe(true);
    expect(r.eleve.code).toMatch(/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
    expect(r.token).toContain('stu_1');
    expect(r.eleve.name).toBe('أحمد بن عمر');
    // L'écriture en base porte bien l'identifiant interne dérivé du code.
    expect(store.inscriptions[0]).toBe(`${normaliserCode(r.eleve.code)!.toLowerCase()}@${DOMAINE_INTERNE}`);
  });

  it('ne stocke JAMAIS le code secret en clair', async () => {
    const store = fauxStore();
    await inscrireSansEmail(store, INSCRIPTION, outils());
    const eleve = store.eleve(store.inscriptions[0])!;
    expect(eleve.passwordHash).not.toBe('481902');
    expect(eleve.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(await bcrypt.compare('481902', eleve.passwordHash)).toBe(true);
  });

  it('rejette un code secret faible AVANT toute écriture', async () => {
    for (const pin of ['1234', '123456', '000000', 'abcdef', '']) {
      const store = fauxStore();
      const r = await inscrireSansEmail(store, { name: 'ياسين', pin }, outils());
      expect(r.ok, String(pin)).toBe(false);
      if (!r.ok) expect(r.erreur, String(pin)).toBe('weak_pin');
      expect(store.taille(), `aucune écriture pour « ${pin} »`).toBe(0);
    }
  });

  it('rejette un nom vide ou d’un seul caractère', async () => {
    for (const name of ['', '  ', 'أ', undefined, null, 42]) {
      const r = await inscrireSansEmail(fauxStore(), { name, pin: '481902' }, outils());
      expect(r.ok, String(name)).toBe(false);
      if (!r.ok) expect(r.erreur).toBe('missing_name');
    }
  });

  it('n’attribue JAMAIS deux fois le même code (200 inscriptions réelles)', async () => {
    const store = fauxStore();
    const codes = new Set<string>();
    for (let i = 0; i < 200; i += 1) {
      const r = await inscrireSansEmail(store, { name: `élève ${i}`, pin: '481902' }, outils());
      if (!r.ok) throw new Error(`inscription ${i} refusée : ${r.erreur}`);
      codes.add(r.eleve.code!);
    }
    expect(codes.size).toBe(200);
    expect(store.taille()).toBe(200);
  });

  it('retente quand un code est déjà pris (collision simulée)', async () => {
    const store = fauxStore();
    const premier = await inscrireSansEmail(store, INSCRIPTION, outils());
    expect(premier.ok).toBe(true);
    if (!premier.ok) return;
    const codePris = premier.eleve.code!;

    // Force la première collision, puis laisse le hasard réel faire le reste.
    let appels = 0;
    const r = await inscrireSansEmail(
      store,
      { name: 'سارة', pin: '481902' },
      outils({
        genererCode: () => {
          appels += 1;
          return appels === 1 && codePris ? codePris.replace('-', '') : candidatReel(appels);
        },
      }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(appels).toBeGreaterThanOrEqual(2); // collision détectée, pas écrasée
    expect(r.eleve.code).not.toBe(codePris);
    expect(store.taille()).toBe(2);
  });

  it('rend 503 après 5 essais quand tout code est déjà pris (jamais de boucle infinie)', async () => {
    let essais = 0;
    const toutPris = {
      findStudentByEmail: () => {
        essais += 1;
        return { id: 'x', email: 'k7f29qx3@eleve.local', passwordHash: '$2a$04$', name: 'x' };
      },
      createStudent: () => {
        throw new Error('ne doit jamais être appelé');
      },
    };
    const r = await inscrireSansEmail(toutPris, INSCRIPTION, outils());
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.erreur).toBe('code_generation_failed');
      expect(r.statut).toBe(503);
    }
    expect(essais).toBe(5); // borné : exactement 5 tentatives
  });

  it('remonte l’erreur si la base refuse l’écriture (course entre deux inscriptions)', async () => {
    // Cas réel : deux élèves s'inscrivent à la même milliseconde, le premier
    // a déjà écrit le code que le second vient de tirer. L'index UNIQUE parle.
    const course = {
      findStudentByEmail: () => null, // au moment du test, le code semble libre
      createStudent: () => {
        const e: any = new Error('email_exists');
        e.statusCode = 409;
        throw e;
      },
    };
    await expect(inscrireSansEmail(course, INSCRIPTION, outils())).rejects.toThrow(/email_exists/);
  });
});

/** Un code valide déterministe, hors de l'alphabet ambigu. */
function candidatReel(n: number): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const tige = n.toString(31).toUpperCase();
  return (tige + alphabet).slice(0, 8);
}

describe('connexion par code OU par adresse e-mail — une seule porte', () => {
  it('accepte le code tel qu’affiché (avec tiret)', async () => {
    const store = fauxStore();
    const o = outils();
    const ins = await inscrireSansEmail(store, INSCRIPTION, o);
    if (!ins.ok) throw new Error('inscription');
    const r = await connecterParIdentifiant(
      store,
      { identifiant: ins.eleve.code, password: '481902' },
      o,
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.token).toBe('jeton.stu_1');
  });

  it('accepte minuscules, espaces, points — la réalité du clavier d’un élève', async () => {
    const store = fauxStore();
    const o = outils();
    const ins = await inscrireSansEmail(store, INSCRIPTION, o);
    if (!ins.ok) throw new Error('inscription');
    const code = ins.eleve.code!;
    for (const saisie of [
      code.toLowerCase(),
      code.replace('-', '').toLowerCase(),
      ` ${code.toLowerCase()} `,
      code.replace('-', '.').toLowerCase(),
    ]) {
      const r = await connecterParIdentifiant(store, { identifiant: saisie, password: '481902' }, o);
      expect(r.ok, saisie).toBe(true);
    }
  });

  it('accepte le code recopié en chiffres arabo-indiens', async () => {
    const store = fauxStore();
    const o = outils();
    const ins = await inscrireSansEmail(store, { name: 'أمينة', pin: '481902' }, o);
    if (!ins.ok) throw new Error('inscription');
    // L'élève recopie sur son papier : 4 → ٤, 8 → ٨…
    const arabise = ins.eleve.code!
      .replace(/4/g, '٤')
      .replace(/8/g, '٨')
      .replace(/9/g, '٩')
      .replace(/2/g, '٢');
    const r = await connecterParIdentifiant(store, { identifiant: arabise, password: '481902' }, o);
    expect(r.ok).toBe(true);
  });

  it('laisse fonctionner les comptes à adresse e-mail (aucune régression)', async () => {
    const store = fauxStore();
    const o = outils();
    await store.createStudent('stu_mail', 'eleve@ecole.dz', await o.hacher('motdepasse1'), 'سارة');
    const r = await connecterParIdentifiant(store, { email: 'Eleve@Ecole.DZ', password: 'motdepasse1' }, o);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.eleve.email).toBe('eleve@ecole.dz'); // affichable : ce n'est pas un code
    expect(r.eleve.code).toBeNull();
  });

  it('répond 401 avec les MÊMES mots pour tous les échecs', async () => {
    const store = fauxStore();
    const o = outils();
    await inscrireSansEmail(store, INSCRIPTION, o);
    const cas = [
      { identifiant: 'K7F2-9QX3', password: '999999' }, // code inexistant
      { identifiant: 'pas un code', password: '481902' }, // forme invalide
      { password: '481902' }, // rien
      { identifiant: 'K7F29QX3' }, // sans mot de passe
    ];
    for (const c of cas) {
      const avant = store.lectures();
      const r = await connecterParIdentifiant(store, c as any, o);
      expect(r.ok, JSON.stringify(c)).toBe(false);
      if (!r.ok) expect(r.erreur).toBe('invalid_credentials');
      // Une saisie hors format ne doit même pas interroger la base.
      if (!estCode(String(c.identifiant ?? ''))) {
        expect(store.lectures(), JSON.stringify(c)).toBe(avant);
      }
    }
  });
});

describe('ce que l’API a le droit de montrer', () => {
  it('ne laisse JAMAIS fuir l’adresse technique interne', async () => {
    const store = fauxStore();
    const ins = await inscrireSansEmail(store, INSCRIPTION, outils());
    if (!ins.ok) throw new Error('inscription');
    expect(ins.eleve.email).toBeNull();
    expect(JSON.stringify(ins)).not.toContain(DOMAINE_INTERNE);
    expect(JSON.stringify(ins)).not.toContain('@');
    // Et l'identifiant interne est bien celui qui est stocké.
    expect(estIdentifiantInterne(store.inscriptions[0])).toBe(true);
  });

  it('donne le code affichable du côté professeur, pas l’adresse interne', async () => {
    const store = fauxStore();
    const ins = await inscrireSansEmail(store, INSCRIPTION, outils());
    if (!ins.ok) throw new Error('inscription');
    const eleve = store.eleve(store.inscriptions[0])!;
    const vue = donneesPubliques(eleve);
    expect(vue.code).toBe(ins.eleve.code);
    expect(vue.email).toBeNull();
  });

  it('laisse passer un e-mail ordinaire sans le transformer en code', () => {
    const vue = donneesPubliques({ id: 'stu_x', email: 'prof.test@gmail.com', name: 'x' });
    expect(vue.email).toBe('prof.test@gmail.com');
    expect(vue.code).toBeNull();
  });
});

describe('réinitialisation du secret — ne jamais enfermer un élève dehors', () => {
  const sansEmail = { email: 'k7f29qx3@eleve.local' };
  const avecEmail = { email: 'eleve@gmail.com' };

  it('un compte SANS e-mail garde un secret à 6 chiffres', () => {
    // Sinon l'élève ne peut plus saisir son secret depuis l'écran « بالرمز »
    // (champ à 6 chiffres) — et il n'a AUCUNE adresse de secours.
    for (const mauvais of ['motdepasse', 'Abc123', '12345', '1234567', '', null]) {
      const r = validerNouveauSecret(sansEmail, mauvais);
      expect(r.ok, String(mauvais)).toBe(false);
      if (!r.ok) expect(r.erreur).toBe('weak_pin');
    }
    expect(validerNouveauSecret(sansEmail, '481902').ok).toBe(true);
    expect(validerNouveauSecret(sansEmail, '٤٨١٩٠٢').ok).toBe(true);
  });

  it('un compte AVEC e-mail garde la politique historique (6 caractères)', () => {
    expect(validerNouveauSecret(avecEmail, 'motdepasse').ok).toBe(true);
    expect(validerNouveauSecret(avecEmail, '123456').ok).toBe(true);
    const court = validerNouveauSecret(avecEmail, 'abc');
    expect(court.ok).toBe(false);
    if (!court.ok) {
      expect(court.erreur).toBe('weak_password');
      expect(court.statut).toBe(400);
    }
  });
});
