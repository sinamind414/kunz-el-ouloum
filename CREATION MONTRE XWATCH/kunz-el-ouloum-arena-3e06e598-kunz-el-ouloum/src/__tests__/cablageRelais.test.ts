// cablageRelais.test.ts — LE RELAIS HUMAIN NE DOIT PAS EXISTER SEULEMENT DANS LES TESTS.
//
// Ce dépôt a payé trois fois le même défaut : un module juste, testé, et JAMAIS
// BRANCHÉ (`spacedRecallPrompts` jamais affiché, `nextAction:'schedule_recall'`
// jamais lu, `oublierErreur()` jamais appelée). L'étape 5 a la même exposition :
// `lib/relais.ts` peut être parfait et personne ne jamais voir sa question.
//
// Quatre points de connexion sont donc surveillés — plus les deux promesses de
// l'étape 5, qui ne se vérifient PAS par un test de comportement :
//
//   · rien n'appelle le réseau dans ce chemin (« l'app ne contacte personne,
//     jamais ») — vérifié sur la source, et c'est ici le bon outil : un appel
//     réseau ajouté demain ne changerait aucun résultat observable aujourd'hui ;
//   · le relais n'importe NI `prescriptions` NI `profilErreurs` : la flèche ne va
//     que dans un sens, donc aucun compteur de la boucle ne peut bouger.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const lire = (chemin: string) => readFileSync(resolve(process.cwd(), chemin), 'utf8');

const APP = lire('src/App.tsx');
const HOOK = lire('src/hooks/useInvitationCapitaine.ts');
const MODULE = lire('src/lib/relais.ts');
const CARTE = lire('src/components/RelaisCapitaine.tsx');

describe('les quatre points de connexion du relais', () => {
  it('1. le module PUR décide, et le capitaine lui passe le moment', () => {
    const invitation = lire('src/lib/invitationCapitaine.ts');
    expect(invitation, 'le relais n’est plus consulté par le module pur').toContain('questionDuRelais({');
    expect(invitation, 'les portes du silence ne sont plus partagées').toContain('capitainePeutParler(');
    expect(HOOK, 'le hook ne demande plus la question du relais').toContain('relaisDuMoment(');
    expect(HOOK, 'le hook n’assemble plus l’état').toContain('lireEtatEleve(');
  });

  it('2. l’état REMONTE le nom par la famille « relation » — pas par une lecture sauvage', () => {
    const etat = lire('src/lib/etatEleve.ts');
    expect(etat, 'la famille « relation » ne porte plus le relais').toContain('relais: Relais;');
    expect(etat, 'le relais n’est plus lu avec l’état').toContain('relais: lireRelais()');
    expect(etat, 'l’adaptateur ne le transmet plus au capitaine').toMatch(/relais:\s*etat\.relation\.relais/);
  });

  it('3. LA CARTE EST RENDUE, et à l’intérieur de la colonne du capitaine', () => {
    expect(APP, 'la carte du relais n’est plus importée').toContain("from './components/RelaisCapitaine'");
    expect(APP, 'la carte du relais n’est plus rendue').toContain('<RelaisCapitaine question={relais}');
    expect(HOOK, 'le hook n’expose plus la question').toMatch(/return \{ invitation, relais, etat/);

    // La colonne est déjà gardée par l'épreuve, le mode focus et l'onglet du
    // capitaine. La carte doit être DEDANS : sinon elle parle pendant une épreuve
    // chronométrée, ou par-dessus le guide dans son propre onglet.
    const garde = APP.search(/!isFocusMode && !epreuveEnCours && currentTab !== 'chat'/);
    expect(garde, 'la garde d’affichage de la colonne a disparu').toBeGreaterThan(-1);
    const ouvre = APP.lastIndexOf('{', garde);
    let profondeur = 0;
    let ferme = -1;
    for (let i = ouvre; i < APP.length; i++) {
      if (APP[i] === '{') profondeur++;
      else if (APP[i] === '}') {
        profondeur--;
        if (profondeur === 0) {
          ferme = i;
          break;
        }
      }
    }
    const carte = APP.indexOf('<RelaisCapitaine');
    expect(ferme, 'bloc de la colonne non refermé ?').toBeGreaterThan(0);
    expect(carte, 'la carte est placée AVANT la colonne').toBeGreaterThan(ouvre);
    expect(carte, 'la carte est sortie de la colonne gardée par l’épreuve').toBeLessThan(ferme);
  });

  it('4. l’élève écrit, l’élève répond — et c’est le module qui enregistre', () => {
    expect(CARTE, 'le nom n’est plus enregistré').toContain('nommerRelais(');
    expect(CARTE, 'la réponse n’est plus enregistrée').toContain('repondreAuRelais(');
    expect(CARTE, 'le refus n’est plus enregistré').toContain('refuserLeRelais(');
    expect(CARTE, 'la question n’est plus datée à l’affichage').toContain('marquerDemandePosee(');
    expect(MODULE, 'le nom n’est plus écrit en local').toContain('window.localStorage');
  });
});

describe('les deux promesses de l’étape 5 — celles qu’un comportement ne prouve pas', () => {
  it('RIEN NE SORT : aucun appel réseau dans le chemin du relais', () => {
    for (const [fichier, source] of [
      ['src/lib/relais.ts', MODULE],
      ['src/components/RelaisCapitaine.tsx', CARTE],
    ] as const) {
      expect(
        source,
        `${fichier} contient un appel réseau : le relais ne sort jamais de l’appareil`,
      ).not.toMatch(/\bfetch\s*\(|sendBeacon|XMLHttpRequest|new WebSocket|navigator\.share|window\.open\s*\(/);
    }
  });

  it('AUCUNE CONSÉQUENCE : le relais ne peut pas atteindre un compteur de la boucle', () => {
    // La flèche va dans un seul sens : `invitationCapitaine` importe `relais`,
    // l'inverse est impossible. Donc nommer, répondre ou refuser ne peut pas
    // fabriquer un échec, retirer un motif, ni fermer une erreur.
    expect(MODULE, 'le relais touche à la boucle').not.toMatch(/from '\.\/prescriptions'/);
    expect(MODULE, 'le relais touche au profil d’erreurs').not.toMatch(/profilErreurs/);
    expect(HOOK, 'le relais est émis comme une prescription').not.toMatch(/emettrePrescription\((question|relais)/);
    expect(HOOK, 'la prescription n’est plus émise pour la parole affichée').toMatch(/emettrePrescription\(duMoment/);
  });
});
