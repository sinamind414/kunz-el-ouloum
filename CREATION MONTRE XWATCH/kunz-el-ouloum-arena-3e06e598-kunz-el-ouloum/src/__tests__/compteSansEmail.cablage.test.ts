// ============================================================
// compteSansEmail.cablage.test.ts — verrous de CÂBLAGE.
//
// Les tests de src/server/inscriptionSansEmail.test.ts prouvent que le
// parcours « sans e-mail » fonctionne. Ceux-ci prouvent qu'il est bien
// BRANCHÉ — et qu'aucun retour en arrière ne peut se glisser :
//   · les routes existent et passent par les limiteurs de débit ;
//   · l'ordre des routes est correct (avant le serveur Vite) ;
//   · l'identifiant technique `<code>@eleve.local` ne sort JAMAIS
//     vers l'élève NI vers le professeur ;
//   · l'exemple trompeur « eleve@ecole.dz » ne revient nulle part.
// ============================================================
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const lire = (...p: string[]) => fs.readFileSync(path.resolve(process.cwd(), ...p), 'utf-8');
const serverSrc = () => lire('server.ts');

/**
 * Retire commentaires et chaînes de documentation. Ce qui compte n'est pas
 * qu'un commentaire explique l'ancien défaut (c'est utile), mais qu'aucun
 * placeholder AFFICHÉ ne le reprenne.
 */
const sansCommentaires = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

describe('routes d’inscription et de connexion sans e-mail', () => {
  it('les deux routes existent et s’appuient sur le module testable', () => {
    const src = serverSrc();
    expect(src).toContain('app.post("/api/auth/register-code"');
    // Le corps de la route ne réimplémente PAS la logique : il délègue.
    expect(src).toContain('await inscrireSansEmail(store, req.body ?? {}, outilsAuth)');
    expect(src).toContain('await connecterParIdentifiant(store, req.body ?? {}, outilsAuth)');
    expect(src).toContain('import { codeDepuisIdentifiant, resoudreIdentifiant } from "./src/server/codeEleve"');
  });

  it('les deux routes sont derrière les limiteurs de débit', () => {
    const src = serverSrc();
    const bloc = src.slice(src.indexOf('app.post("/api/auth/register-code"'), src.indexOf('app.post("/api/auth/register"'));
    expect(bloc).toContain('ipLimiter.hit');
    const blocLogin = src.slice(src.indexOf('app.post("/api/auth/login"'), src.indexOf('app.get("/api/auth/me"'));
    expect(blocLogin).toContain('ipLimiter.hit');
    expect(blocLogin).toContain('loginAccountLimiter.hit');
    expect(blocLogin).toContain('loginAccountLimiter.reset');
  });

  it('le quota de connexion compte les DEUX formes d’un même code', () => {
    // Sinon, « k7f2-9qx3 », « K7F29QX3 » et « k7f2.9qx3 » seraient trois
    // tentatives distinctes : de quoi deviner un code secret à 6 chiffres.
    const src = serverSrc();
    expect(src).toContain('const cleQuotaConnexion = (raw: unknown): string => resoudreIdentifiant(raw) || "?"');
    expect(src).toContain('loginAccountLimiter.hit(cle)');
    // La route de connexion ÉLÈVE ne compte plus par e-mail brut…
    const blocLogin = src.slice(src.indexOf('app.post("/api/auth/login"'), src.indexOf('app.get("/api/auth/me"'));
    expect(blocLogin).not.toContain('loginAccountLimiter.hit(String(email || ""))');
  });

  it('les routes sont déclarées AVANT le serveur Vite (sinon c’est l’app qui répond)', () => {
    const src = serverSrc();
    const derniere = src.indexOf('app.post("/api/auth/login"');
    const vite = src.indexOf('await createViteServer(');
    const repli = src.indexOf('app.get("*"');
    expect(derniere).toBeGreaterThan(0);
    expect(vite).toBeGreaterThan(derniere);
    expect(repli).toBeGreaterThan(vite);
    // Aucune des deux routes ne doit se retrouver dans le handler /api/health.
    const health = src.indexOf('app.get("/api/health"');
    const finHealth = src.indexOf('app.post("/api/auth/register-code"');
    expect(finHealth).toBeGreaterThan(health);
    expect(src.slice(health, finHealth)).not.toContain('register-code');
  });

  it('un store indisponible répond 503 « storage_unavailable », pas 500', () => {
    const src = serverSrc();
    // Les comptes sont désactivés en mode dégradé : le dire clairement, et
    // ne pas présenter une panne de persistance comme une erreur serveur.
    expect(src).toContain('res.status(503).json({ error: "storage_unavailable" })');
  });
});

describe('réinitialisation du secret : cohérence avec l’écran de connexion', () => {
  it('la route impose le code à 6 chiffres pour un compte sans e-mail', () => {
    const src = serverSrc();
    const bloc = src.slice(src.indexOf('app.post("/api/student/reset-password"'), src.indexOf('app.get("/api/teacher/export/csv"'));
    expect(bloc).toContain('validerNouveauSecret(student, password)');
    // Le refus doit précéder l'écriture du mot de passe ET la consommation du
    // code du professeur (le dernier markResetUsed = celui du succès ; le
    // premier, lui, marque un code expiré et arrive légitimement avant).
    expect(bloc.indexOf('validerNouveauSecret')).toBeLessThan(bloc.indexOf('updateStudentPassword'));
    expect(bloc.indexOf('validerNouveauSecret')).toBeLessThan(bloc.lastIndexOf('markResetUsed(code)'));
  });

  it('l’écran de connexion n’efface plus les lettres du secret', () => {
    const src = lire('src/components/StudentAuthView.tsx');
    // À l'inscription : chiffres seulement. À la connexion : ce que l'élève tape.
    expect(src).toContain("mode === 'register' ? (pin || '').replace(/\\D/g, '').slice(0, 6) : (pin || '').slice(0, 32)");
    return;
  });
});

describe('l’adresse technique interne ne sort jamais', () => {
  it('/api/auth/me renvoie les données publiques, pas la ligne stockée', () => {
    const src = serverSrc();
    const bloc = src.slice(src.indexOf('app.get("/api/auth/me"'), src.indexOf('app.get("/api/student/entries"'));
    expect(bloc).toContain('donneesPubliques(student)');
    expect(bloc).not.toContain('email: student.email');
  });

  it('le tableau de bord professeur affiche le code, pas `<code>@eleve.local`', () => {
    const src = serverSrc();
    const bloc = src.slice(src.indexOf('app.get("/api/teacher/dashboard"'), src.indexOf('app.get("/api/teacher/entries"'));
    expect(bloc).toContain('code: codeDepuisIdentifiant(s.email)');
    expect(bloc).toContain('email: codeDepuisIdentifiant(s.email) ? null : s.email');
  });

  it('l’export CSV porte une colonne « code » et non « email »', () => {
    const src = serverSrc();
    // `marque` (A3, 14/10/2026) s'intercale après `code` : c'est la colonne qui
    // permet au professeur de remonter d'un document exporté jusqu'à l'élève.
    expect(src).toContain('["student_id", "name", "code", "marque", "productions"');
    expect(src).not.toContain('["student_id", "name", "email", "productions"');
    // Les deux écritures de lignes traduisent l'identifiant interne.
    expect(src.match(/codeDepuisIdentifiant\(/g)?.length ?? 0).toBeGreaterThanOrEqual(4);
  });
});

describe('le formulaire ne redemande plus une adresse de l’école', () => {
  it('aucun champ n’affiche plus une adresse de l’école en exemple', () => {
    const fichiers = [
      'src/components/StudentAuthView.tsx',
      'src/utils/api.ts',
      'src/components/DashboardView.tsx',
    ];
    for (const f of fichiers) {
      const code = sansCommentaires(lire(...f.split('/')));
      expect(code.includes('eleve@ecole.dz'), `${f} : exemple trompeur revenu`).toBe(false);
      // Aucun attribut placeholder du code exécutable ne suggère une adresse scolaire.
      const placeholders = code.match(/placeholder="[^"]*"/g) || [];
      for (const ph of placeholders) {
        expect(/ecole|ecole\.dz|\.edu\.dz/i.test(ph), `${f} : ${ph}`).toBe(false);
      }
    }
  });

  it('le chemin par défaut du formulaire est le code, pas le couple e-mail/mot de passe', () => {
    const src = lire('src/components/StudentAuthView.tsx');
    expect(src).toContain("useState<Voie>('code')");
    expect(src).toContain('registerStudentCode');
    // Le champ « code secret » ne laisse entrer que des chiffres.
    expect(src).toContain("(pin || '').replace(/\\D/g, '').slice(0, 6)");
  });

  it('l’API client envoie une seule porte au serveur (code OU e-mail)', () => {
    const src = lire('src/utils/api.ts');
    expect(src).toContain('/api/auth/register-code');
    expect(src).toContain('pin: (codeSecret || \'\').trim()');
    expect(src).toContain("estEmail ? { email: normalizeEmail(valeur), password } : { identifiant: valeur, password }");
  });

  it('l’accueil propose la création de compte (l’avatar de l’en-tête n’est plus le seul chemin)', () => {
    const app = lire('src/App.tsx');
    const dash = lire('src/components/DashboardView.tsx');
    expect(dash).toContain('carte-compte-sans-email');
    expect(dash).toContain('onOpenAuth');
    expect(app).toContain('onOpenAuth={() => setIsAuthOpen(true)}');
    expect(app).toContain('connecte={Boolean(studentName || studentEmail)}');
  });
});
