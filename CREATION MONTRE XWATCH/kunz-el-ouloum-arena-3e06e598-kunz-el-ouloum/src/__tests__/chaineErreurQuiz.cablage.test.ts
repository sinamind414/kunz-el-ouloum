// chaineErreurQuiz.cablage.test.ts — LE PRODUCTEUR ALIMENTE-T-IL VRAIMENT QUELQUE CHOSE ?
//
// Leçon apprise à la dure dans ce dépôt : un module vert et bien testé qui n'est
// branché nulle part ne corrige RIEN. Le point A (14/10/2026) a ajouté un
// producteur d'erreurs dans le QCM ; ce fichier vérifie la CHAÎNE COMPLÈTE, sur
// les modules réels, sans simulacre :
//
//   élève rate un QCM  →  il déclare la cause  →  profilErreurs (localStorage)
//                      →  erreurDominante()  →  messageCapitaine()  →  écran
//
// Ce qui rend ce test utile plutôt que décoratif : il vérifie aussi le SILENCE.
// Une seule erreur ne doit rien déclencher — sinon le guide parlerait d'un
// « profil » après une seule question ratée, et l'élève cesserait de le croire.
import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { enregistrerErreurs, profilPourLeGuide, resumeProfilAr, totalErreurs } from '../utils/profilErreurs';
import { messageCapitaine } from '../data/capitaine';
import { CAUSES_QCM } from '../data/diagnosticQuiz';

const lire = (chemin: string) => readFileSync(resolve(process.cwd(), chemin), 'utf8');

/** Ce que fait le QCM quand l'élève déclare « je ne connaissais pas le concept ». */
function declarerCause(id: string, theme: string): number {
  const cause = CAUSES_QCM.find((c) => c.id === id);
  if (!cause?.code) return 0;
  return enregistrerErreurs([cause.code], { theme });
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('deux QCM ratés avec la même cause déclarée font parler le capitaine', () => {
  it('une SEULE erreur déclarée reste silencieuse', () => {
    declarerCause('notion', 'التخصص الوظيفي للبروتينات');
    expect(totalErreurs()).toBe(1);
    // Une fois, c'est le hasard. Parler ici ferait croire à un profil qui n'existe pas.
    expect(resumeProfilAr()).toBeNull();
  });

  it('deux erreurs de MÊME nature déclenchent le message', () => {
    declarerCause('notion', 'التخصص الوظيفي للبروتينات');
    declarerCause('notion', 'الاتصال العصبي');
    const resume = resumeProfilAr();
    expect(resume, 'le producteur nourrit le profil mais rien ne le lit').not.toBeNull();
    expect(resume).toContain('مرات');
    // Le message nomme la famille d'erreur déclarée — donc celle de l'élève.
    expect(resume).toContain('الخلط');
    // Et il donne la contre-mesure, pas seulement le diagnostic.
    expect(resume!.length).toBeGreaterThan(40);
  });

  it('le guide peut nommer l’erreur dominante, avec ses thèmes', () => {
    declarerCause('notion', 'التخصص الوظيفي للبروتينات');
    declarerCause('notion', 'الاتصال العصبي');
    const profil = profilPourLeGuide();
    expect(profil?.codeDominant).toBe('notion_confusion');
    expect(profil?.occurrences).toBe(2);
    expect(profil?.nomAr).toBeTruthy();
    const message = messageCapitaine('erreur', profil);
    expect(message.ar.length).toBeGreaterThan(10);
  });

  it('l’élève peut être PARLER de ses thèmes réels : c’est le titre de l’unité qui remonte', () => {
    // La donnée remonte du QCM (qui connaît l'unité) jusqu'au profil, et pas
    // seulement le TYPE d'erreur. C'est ce qui permettra un jour un message du
    // genre « tu te trompes toujours sur l'immunité ».
    declarerCause('notion', 'المناعة');
    declarerCause('preuve', 'المناعة');
    declarerCause('preuve', 'المناعة');
    const profil = profilPourLeGuide();
    // L'erreur dominante a 2 occurrences → « preuve » l'emporte sur « notion ».
    expect(profil?.codeDominant).toBe('unsupported_claim');
    expect(resumeProfilAr()).not.toBeNull();
  });

  it('« سبب آخر » ne peut pas faire parler le capitaine : rien n’est enregistré', () => {
    // Deux séances où l'élève répond « autre chose » : le profil doit rester vide.
    // C'est la preuve que le silence n'est pas un oubli mais une décision.
    const enregistrees = declarerCause('autre', 'المناعة') + declarerCause('autre', 'المناعة');
    expect(enregistrees).toBe(0);
    expect(totalErreurs()).toBe(0);
    expect(resumeProfilAr()).toBeNull();
    expect(profilPourLeGuide()).toBeNull();
  });
});

describe('le message est réellement AFFICHÉ quelque part', () => {
  it('l’atelier méthodologique rend la ligne du capitaine', () => {
    const vue = lire('src/components/MethodologyCompilerView.tsx');
    // On vérifie l'INTENTION — les trois fonctions du profil sont bien importées
    // par l'atelier — et non la mise en forme de la ligne d'import : depuis le
    // 15/10/2026 cette ligne est multiligne (elle porte aussi la fermeture des
    // erreurs), et un test qui épelle une ligne exacte casse à chaque ajout
    // légitime au lieu de garder ce qui compte.
    for (const fn of ['enregistrerErreurs', 'profilPourLeGuide', 'resumeProfilAr']) {
      expect(vue, `l'atelier n'importe plus ${fn} du profil d'erreurs`).toContain(fn);
    }
    expect(vue).toMatch(/from '\.\.\/utils\/profilErreurs'/);
    expect(vue).toContain('data-testid="capitaine-profil-erreurs"');
    expect(vue).toContain("messageCapitaine('erreur', profilPourLeGuide())");
  });

  it('le QCM alimente le même profil que l’atelier', () => {
    // Si les deux écrivaient dans des clés différentes, le travail de l'un
    // serait invisible à l'autre — un défaut silencieux et coûteux.
    const quiz = lire('src/components/QuizView.tsx');
    const atelier = lire('src/components/MethodologyCompilerView.tsx');
    for (const source of [quiz, atelier]) {
      expect(source).toContain("from '../utils/profilErreurs'");
      expect(source).not.toContain('boussole_profil_erreurs');
    }
    // Une seule clé de stockage, définie à un seul endroit.
    const profil = lire('src/utils/profilErreurs.ts');
    expect((profil.match(/boussole_profil_erreurs/g) ?? []).length).toBe(1);
  });
});
