// cablageBoucleCoach.test.ts — LA BOUCLE NE DOIT PAS ÊTRE DÉBRANCHÉE EN SILENCE.
//
// Le défaut réparé le 15/10/2026 n'était pas un bug : c'était une ABSENCE DE
// CONNEXION. `oublierErreur()` existait depuis longtemps, testée, et n'était
// appelée nulle part sauf dans son propre test. Trois fois de suite ce dépôt a
// payé le même défaut — `spacedRecallPrompts` jamais montré à un élève,
// `MICRO_REMEDIATIONS.nextAction` jamais lu, `oublierErreur` jamais appelée.
//
// Un test de comportement ne protège pas de ça : le module fonctionne, il n'est
// simplement pas branché. Ce fichier surveille donc les QUATRE POINTS DE
// CONNEXION, un par un. Chacun d'eux est une ligne qu'un refactor peut
// supprimer sans qu'aucun test unitaire ne s'en aperçoive.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const lire = (chemin: string) => readFileSync(resolve(process.cwd(), chemin), 'utf8');

const APP = lire('src/App.tsx');
const HOOK = lire('src/hooks/useInvitationCapitaine.ts');
const ACTIVITE = lire('src/utils/activiteQuotidienne.ts');
const ATELIER = lire('src/components/MethodologyCompilerView.tsx');

describe('les quatre points de connexion de la boucle', () => {
  it('1. la bulle ÉMET une prescription quand elle parle', () => {
    expect(HOOK, 'le hook n’importe plus la boucle').toMatch(
      /from '\.\.\/lib\/prescriptions'/,
    );
    expect(HOOK, 'la parole affichée n’est plus tracée').toContain('emettrePrescription(');
  });

  it('2. l’élève ACCEPTE (clic) ou IGNORE (fermeture) — deux issues distinctes', () => {
    expect(APP, 'le clic n’est plus mémorisé').toContain('accepter()');
    expect(APP).toContain('onClick={ignorer}');
    expect(HOOK, 'l’ignorance n’est plus consignée').toContain('marquerIgnoree(');
  });

  it('3. le TRAVAIL MESURÉ honore la prescription', () => {
    // C'est `appliquerActiviteQuotidienne` qui atteste d'un travail réel : le
    // compteur monte. Un clic ou un changement d'onglet ne prouvent rien.
    expect(ACTIVITE, 'le travail mesuré ne crédite plus la prescription').toContain('marquerSuivie(');
    expect(ACTIVITE).toMatch(/import \{ marquerSuivie \} from '\.\.\/lib\/prescriptions'/);
  });

  it('4. une erreur prescrite qui DISPARAÎT est fermée — et le crédit est mesuré', () => {
    expect(ATELIER, 'la fermeture n’est plus appelée').toContain('cloreErreursAbsentes(');
    expect(ATELIER).toContain('phraseErreurFermeeAr(');
    expect(ATELIER, 'le crédit n’est plus affiché').toContain('data-testid="credit-erreur-fermee"');
  });
});

describe('le piège de placement — la fermeture doit être HORS du « si erreur détectée »', () => {
  it('un appel à cloreErreursAbsentes n’est PAS dans un bloc « detectedErrors.length > 0 »', () => {
    // C'est LE point qu'un refactor peut casser sans que rien ne s'allume : une
    // erreur prescrite se ferme précisément quand elle N'APPARAÎT PLUS. Placer
    // l'appel dans le `if (detectedErrors.length > 0)` — où vit le reste du
    // traitement des erreurs, et où il est donc naturel de l'écrire — rendrait la
    // fermeture impossible dans le SEUL cas où elle est vraie. Le code ne
    // planterait pas ; le capital ne monterait simplement jamais.
    const appels = ATELIER.split('bouclerApresCorrection(').length - 1;
    // Les DEUX sites de correction : stage 2 (plan) et stage 3/4 (production).
    // La définition ne compte pas (elle s'écrit `bouclerApresCorrection = (`).
    expect(appels, 'les deux corrections doivent boucler, pas une seule').toBe(2);

    // Mesure d'imbrication RÉELLE : pour chaque appel, on repère le dernier
    // `if (… detectedErrors.length > 0)` ouvert avant lui, on cherche où ce bloc
    // SE REFERME (appariement d'accolades), et on exige que l'appel soit APRÈS.
    // Compter les accolades entre l'ouverture et l'appel ne suffit pas : à
    // l'intérieur d'un bloc bien formé le solde est nul, donc un appel placé DANS
    // le `if` passerait le contrôle. (Vérifié en cassant exprès le placement.)
    const ouvreur = 'if (rep.detectedErrors.length > 0) {';
    const fermetureBloc = (depuisIndex: number) => {
      // `depuisIndex` = index de l'accolade ouvrante ; renvoie l'index de la
      // fermante correspondante, ou -1 si introuvable.
      let profondeur = 0;
      for (let i = depuisIndex; i < ATELIER.length; i++) {
        if (ATELIER[i] === '{') profondeur++;
        else if (ATELIER[i] === '}') {
          profondeur--;
          if (profondeur === 0) return i;
        }
      }
      return -1;
    };

    let idx = ATELIER.indexOf('bouclerApresCorrection(');
    let verifies = 0;
    while (idx !== -1) {
      const ouverture = ATELIER.lastIndexOf(ouvreur, idx);
      if (ouverture !== -1) {
        const finBloc = fermetureBloc(ouverture + ouvreur.length - 1);
        expect(finBloc, 'bloc « si erreur détectée » non refermé ?').toBeGreaterThan(0);
        expect(
          idx,
          'un appel de fermeture est placé DANS le « si erreur détectée » : il ne ' +
            's’exécuterait jamais dans le seul cas où une erreur disparaît',
        ).toBeGreaterThan(finBloc);
      }
      verifies++;
      idx = ATELIER.indexOf('bouclerApresCorrection(', idx + 1);
    }
    expect(verifies, 'aucun appel vérifié').toBe(2);
    expect(ATELIER, 'la raison du placement doit rester écrite').toContain(
      'se ferme quand elle DISPARAÎT',
    );
  });
});

describe('la conséquence comportementale est elle aussi branchée', () => {
  it('le capitaine reçoit les motifs retirés — sinon il répéterait indéfiniment', () => {
    // Depuis l'état unique (étape 2), ce n'est plus le hook qui va chercher les
    // motifs retirés : ils font partie de la famille « relation », assemblée à un
    // seul endroit, et l'adaptateur les fait passer au module pur.
    const etat = lire('src/lib/etatEleve.ts');
    expect(etat, 'la famille « relation » ne lit plus les motifs retirés').toContain('motifsRetires(registre)');
    expect(etat, 'l’adaptateur ne les transmet plus au capitaine').toMatch(/motifsRetires:\s*etat\.relation\.motifsRetires/);
    expect(HOOK, 'le hook n’assemble plus l’état').toContain('lireEtatEleve(');
    expect(HOOK, 'le hook ne traduit plus l’état en contexte').toContain('contexteCapitaine(etat');
    // Et le module pur doit savoir s'en servir.
    const module = lire('src/lib/invitationCapitaine.ts');
    expect(module).toContain('motifsRetires');
    // La porte du silence, vérifiée sur son TEST et non sur son nom (elle a été
    // renommée `parler` à l'étape 4, quand elle a aussi reçu l'escalade).
    expect(module, 'la porte du silence a disparu').toContain('ctx.motifsRetires?.includes(motif)');
    // Et depuis l'étape 4, la même porte décide aussi de la FORME : ne pas
    // répéter suppose de savoir choisir une autre forme.
    expect(module, 'l’escalade n’est plus appliquée à la parole').toContain('niveauEscalade(ctx.echecsParMotif?.[motif])');
  });
});

describe('le crédit ne doit jamais devenir un encouragement gratuit', () => {
  it('il n’est affiché que si quelque chose a réellement été fermé', () => {
    // `setCreditFermeture` doit être gardé par un `if (fermees.length === 0) return`.
    const bloc = ATELIER.slice(ATELIER.indexOf('const bouclerApresCorrection'));
    expect(bloc.slice(0, 900)).toContain('fermees.length === 0');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// H1 (audit externe 16/10/2026) — la MICRO-REPRISE est branchée.
//
// Le même défaut qu'`oublierErreur` a failli se reproduire une quatrième fois :
// `planifierRappel()` écrite pour honorer `nextAction: 'schedule_recall'`,
// testée dans son propre module, et JAMAIS appelée hors de lui ; le corpus
// `MICRO_REMEDIATIONS` affiché par aucune vue. La couverture COMPORTEMENTALE
// du pont vit dans `lib/__tests__/planificationRappels.test.ts` (effet SM-2
// observé, rouge par mutation). Ici on garde les POINTS DE CONNEXION, car un
// refactor peut débrancher un appel sans qu'aucun test unitaire ne s'en aperçoive.
// ─────────────────────────────────────────────────────────────────────────────
describe('H1 — la micro-reprise après une erreur détectée', () => {
  it('l’atelier PLANIFIE le rappel et AFFICHE la carte aux DEUX sites de correction', () => {
    expect(ATELIER, 'le pont n’est plus importé').toMatch(
      /from '\.\.\/lib\/planificationRappels'/,
    );
    expect(ATELIER, 'la carte du corpus n’est plus rendue').toContain('<CarteMicroRemediation');
    // Les DEUX corrections (stage 2 et stage 3/4) doivent remédier, comme elles
    // doivent TOUTES DEUX boucler — c'est le même piège de placement.
    const appels = ATELIER.split('remedierApresDetection(').length - 1;
    // La définition ne compte pas : elle s'écrit `remedierApresDetection = (`.
    expect(appels, 'les deux corrections doivent remédier, pas une seule').toBe(2);
    const carteAffichee = ATELIER.split('setCarteRemediation').length - 1;
    expect(carteAffichee, 'afficher ET réinitialiser : la carte doit avoir les deux gestes')
      .toBeGreaterThanOrEqual(3); // set initial + affichage + reset
  });

  it('le QCM planifie aussi — le second flux réel de détection', () => {
    const quiz = lire('src/components/QuizView.tsx');
    expect(quiz, 'le pont n’est plus importé côté QCM').toMatch(
      /from '\.\.\/lib\/planificationRappels'/,
    );
    expect(quiz, 'la déclaration de cause ne planifie plus').toContain(
      'planifierRappelsPourErreurs([cause.code])',
    );
  });

  it('le pont HONORE l’intention du corpus — schedule_recall seul agit sur SM-2', () => {
    const pont = lire('src/lib/planificationRappels.ts');
    expect(pont, 'le résolveur unique a disparu').toContain('export function remediationPour');
    expect(pont, 'nextAction n’est plus lu — l’intention du corpus redevient inerte').toContain(
      "remediation.nextAction !== 'schedule_recall'",
    );
    expect(pont, 'l’ordonnanceur n’est plus appelé par le pont').toContain('planifierRappel(');
  });
});
