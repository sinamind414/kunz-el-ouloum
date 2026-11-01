// cablageCapitaine.test.ts — LE SIGNAL EST-IL BRANCHÉ SUR QUELQUE CHOSE ?
//
// Leçon du tour précédent : un module vert et bien testé qui n'est importé nulle
// part ne corrige RIEN. Ces tests lisent le VRAI `App.tsx` et vérifient que la
// bulle y est branchée, que ses destinations sont des onglets qui existent, et
// que le silence pendant l'épreuve n'a pas été contourné.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const app = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');
const hook = readFileSync(resolve(process.cwd(), 'src/hooks/useInvitationCapitaine.ts'), 'utf8');
/** L'état de l'élève, assemblé une fois pour tous les consommateurs (étape 2). */
const etatEleve = readFileSync(resolve(process.cwd(), 'src/lib/etatEleve.ts'), 'utf8');

/** Identifiants d'onglet réellement gérés par App.tsx (relevés à la main). */
const ONGLETS_REELS = new Set([
  'splash', 'reviser', 'review', 'stats', 'badges', 'methodology', 'bootcamp',
  'lesson', 'workshop', 'animations', 'situations', 'schemas', 'training',
  'examens', 'plan', 'bacideas', 'focus', 'tadwin', 'mindmap', 'chat',
  'teacher', 'home',
]);

describe('la bulle est réellement branchée dans App.tsx', () => {
  it('le hook du capitaine est importé ET appelé', () => {
    expect(app).toContain("from './hooks/useInvitationCapitaine'");
    expect(app).toMatch(/useInvitationCapitaine\(\{/);
  });

  it('la bulle est rendue avec ses deux boutons (agir / ne pas insister)', () => {
    expect(app).toContain('data-testid="bulle-capitaine"');
    expect(app).toContain('data-testid="bulle-capitaine-agir"');
    expect(app).toContain('data-testid="bulle-capitaine-fermer"');
  });

  it('« لاحقًا » appelle bien l’oubli temporisé, pas une fermeture définitive', () => {
    const bloc = app.slice(app.indexOf('bulle-capitaine-fermer'));
    expect(bloc.slice(0, 300)).toContain('onClick={ignorer}');
    // Et l'oubli est TEMPORAIRE : il écrit un horodatage, pas un drapeau
    // « ne plus jamais afficher ».
    //
    // L'écriture a déménagé le 15/10/2026 (soir) avec la famille « relation »
    // qu'elle sert : elle vit dans `lib/etatEleve.ts`, qui est désormais le seul
    // module à connaître cet horodatage. L'exigence, elle, ne bouge pas — et le
    // test la vérifie LÀ OÙ ELLE EST, plus le fait que le hook y passe.
    expect(etatEleve).toContain('localStorage.setItem(CLE_IGNOREE, String(maintenantMs))');
    expect(etatEleve).not.toContain("'1')");
    expect(hook).toContain('marquerInvitationIgnoree(t)');
  });

  it('l’action navigue vers l’onglet de l’invitation, en un clic', () => {
    // La destination reste la même — c'est le contrat de la loi 3 (un clic, une
    // destination réelle, jamais une impasse). Depuis le 15/10/2026 le gestionnaire
    // fait une chose de plus AVANT de naviguer : il note l'intention de l'élève
    // (`accepter`), ce qui distingue dans la boucle du coach « il n'a pas vu » de
    // « il a vu et n'a pas pu ». On vérifie les deux, séparément.
    expect(app).toContain('setCurrentTab(invitation.cible)');
    const bloc = app.slice(app.indexOf('bulle-capitaine-agir'));
    expect(bloc.slice(0, 900)).toContain('accepter()');
  });

  it('la bulle n’est pas non plus affichée pendant l’épreuve', () => {
    // Le module renvoie déjà `null` pendant l'épreuve, mais la ceinture ET les
    // bretelles : si une refonte du module oubliait cette règle, l'interface
    // doit continuer à se taire.
    const garde = app.match(/\{!isFocusMode && !epreuveEnCours && currentTab !== 'chat' && \(/);
    expect(garde, 'la condition d’affichage a changé de forme').not.toBeNull();
  });
});

describe('les destinations de la bulle sont des onglets qui EXISTENT', () => {
  it('chaque cible du module correspond à un onglet géré par App.tsx', () => {
    const module = readFileSync(resolve(process.cwd(), 'src/lib/invitationCapitaine.ts'), 'utf8');
    const ligne = module.split('\n').find((l) => l.includes('export type CibleInvitation'));
    expect(ligne, 'type CibleInvitation introuvable').toBeDefined();
    const cibles = [...(ligne!.match(/'([a-z]+)'/g) ?? [])].map((c) => c.replace(/'/g, ''));
    expect(cibles.length).toBeGreaterThanOrEqual(4);
    for (const cible of cibles) {
      expect(ONGLETS_REELS.has(cible), `« ${cible} » n’est pas un onglet d’App.tsx`).toBe(true);
      expect(app, `App.tsx ne gère pas l’onglet « ${cible} »`).toContain(`currentTab === '${cible}'`);
    }
  });

  it('App.tsx n’invente plus de traduction de cible (le type EST l’onglet)', () => {
    expect(app).not.toContain("invitation.cible === 'erreurs'");
    expect(app).not.toContain("invitation.cible === 'entrainement'");
  });
});

describe('l’identité du capitaine est unique et cohérente', () => {
  it('l’onglet du chatbot porte le nom du capitaine', () => {
    expect(app).toContain("currentTab === 'chat' ? CAPITAINE_IDENTITE_AR :");
    expect(app).not.toContain("currentTab === 'chat' ? 'المرشد الذكي'");
  });

  it('le bouton rond du capitaine porte le VISAGE du personnage', () => {
    // 14/10/2026 — demande explicite : « l'icône ronde boussole reste ronde mais
    // à l'intérieur le personnage ». Le rond est le repère : il ne doit pas
    // devenir carré. Il doit aussi garder `aria-label` (un visuel ne parle pas).
    const bloc = app.slice(app.indexOf('data-testid="fab-morchid"'));
    const bouton = bloc.slice(0, 900);
    expect(bouton).toContain('rounded-full');
    expect(bouton).toContain('CAPITAINE_VISAGE_URL');
    expect(bouton).toContain('aria-label={CAPITAINE_IDENTITE_AR}');
    expect(app, 'l’asset du visage doit exister').toContain("CAPITAINE_VISAGE_URL");
  });

  it('l’icône boussole a bien cédé la place (sinon le personnage ne serait pas visible)', () => {
    const bloc = app.slice(app.indexOf('data-testid="fab-morchid"'));
    expect(bloc.slice(0, 900)).not.toContain('<Compass');
  });

  it('la bulle et le bouton utilisent la même source de nom', () => {
    expect(app).toContain('{CAPITAINE_IDENTITE_AR}</p>');
    expect(app).toContain('aria-label={CAPITAINE_IDENTITE_AR}');
  });
});
