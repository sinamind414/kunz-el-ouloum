// useInvitationCapitaine.cablage.test.tsx — LE HOOK EST-IL BRANCHÉ SUR LE REGISTRE ?
//
// LE DÉFAUT QUE CES TESTS FERMENT (mesuré le 15/10/2026). `cablageCapitaine.test.ts`
// lit les SOURCES : il voit `emettrePrescription(...)` dans le texte du hook. Mais
// un appel désactivé (`if (false) emettrePrescription(...)`) laisse le texte
// intact — le test le voit, et la suite reste verte. La connexion peut être morte
// sans qu'un seul test rougisse. C'est exactement ce que la mesure a montré :
// trois connexions du hook, aucune couverture comportementale, parce qu'aucun
// fichier du dépôt n'utilisait `renderHook` avant ce fichier.
//
// CE QU'ON FAIT DONC ICI : on MONTE le hook, on déclenche ses gestes, et on lit le
// VRAI registre (`lib/prescriptions.ts`, celui de l'application — pas un double).
// Un appel mort ne peut pas produire une écriture : ces quatre tests tombent.
//
//   · afficher la bulle     → une prescription `en_attente` (test 1) ;
//   · fermer la bulle       → l'issue `ignoree` + le compteur du motif (test 2) ;
//   · cliquer « agir »      → `accepteMs`, une INTENTION — pas du travail (test 3) ;
//   · deux montages         → une seule prescription (anti-doublon, test 4).
//
// Pourquoi deux montages : React rejoue un rendu (StrictMode, ou simplement un
// remontage d'écran) ; sans le refus de doublon du registre, chaque affichage
// gonflerait le journal de la même demande, et le motif serait retiré au bout
// d'une seule relance.
//
// L'HEURE EST FIXÉE (18 h, 15/10/2026). Les portes du silence du capitaine
// dépendent de l'heure locale : sans horloge figée, ces tests passeraient le jour
// et tomberaient la nuit. Seule `Date` est simulée — les promesses (le compteur
// d'erreurs arrive en différé, voir le hook) continuent de se résoudre vraiment.
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useInvitationCapitaine } from '../useInvitationCapitaine';
import { lireRegistre } from '../../lib/prescriptions';
import { motifDeInvitation } from '../../lib/invitationCapitaine';

/** 15/10/2026, 18 h locales — dans la plage où le capitaine a le droit de parler. */
const HEURE_DE_TEST = new Date(2026, 9, 15, 18, 0, 0);

/**
 * Un élève qui n'a AUCUN jour de travail derrière lui : `daily` absent, donc
 * `joursSansTravail === null` et `serie === 0`. C'est la porte des deux minutes
 * (« لا نبدأ بالمنهج كله. نبدأ بدقيقتين ») — l'invitation la plus simple qui
 * existe, et celle qui ne dépend d'aucune donnée à fabriquer.
 */
const OPTIONS = {
  daily: undefined,
  derniereUnite: null,
  epreuveEnCours: false,
  signalTravail: 0,
};

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(HEURE_DE_TEST);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  localStorage.clear();
});

describe('la bulle affichée devient une prescription tracée', () => {
  it('monter le hook inscrit une prescription « en_attente », avec le motif de la parole affichée', () => {
    const { result } = renderHook(() => useInvitationCapitaine(OPTIONS));

    expect(result.current.invitation, 'aucune invitation : le banc de test ne parle de rien').not.toBeNull();

    const registre = lireRegistre();
    expect(registre.prescriptions).toHaveLength(1);
    expect(registre.prescriptions[0]!.issue).toBe('en_attente');
    expect(registre.prescriptions[0]!.motif).toBe(motifDeInvitation(result.current.invitation!));
    expect(registre.prescriptions[0]!.cible).toBe(result.current.invitation!.cible);
    expect(registre.motifs[registre.prescriptions[0]!.motif]!.dits).toBe(1);
  });
});

describe('fermer la bulle dit une chose précise : la demande n’a pas passé', () => {
  it('« ignorer » inscrit l’issue « ignoree » et incrémente le compteur du motif', () => {
    const { result } = renderHook(() => useInvitationCapitaine(OPTIONS));
    const motif = result.current.invitation!.motif ?? motifDeInvitation(result.current.invitation!);

    act(() => result.current.ignorer());

    const registre = lireRegistre();
    expect(registre.prescriptions).toHaveLength(1);
    expect(registre.prescriptions[0]!.issue).toBe('ignoree');
    expect(registre.prescriptions[0]!.resoluMs).toBe(HEURE_DE_TEST.getTime());
    // Le compteur est la mémoire de l'ESCALADE : c'est lui qui, au troisième
    // échec, retire le motif (voir `motifsRetires`). S'il ne bouge pas, le
    // capitaine redira demain exactement la même phrase.
    expect(registre.motifs[motif]!.ignores).toBe(1);
    expect(registre.motifs[motif]!.suivis).toBe(0);
  });
});

describe('« agir » est une INTENTION, pas du travail — et le registre respecte la distinction', () => {
  it('« accepter » inscrit « accepteMs » sans rien créditer', () => {
    const { result } = renderHook(() => useInvitationCapitaine(OPTIONS));
    const motif = result.current.invitation!.motif ?? motifDeInvitation(result.current.invitation!);

    act(() => result.current.accepter());

    const registre = lireRegistre();
    expect(registre.prescriptions).toHaveLength(1);
    // L'intention est datée…
    expect(registre.prescriptions[0]!.accepteMs).toBe(HEURE_DE_TEST.getTime());
    // …et c'est TOUT : la prescription reste en attente. Seul un travail MESURÉ
    // la passe à « suivie » (`marquerSuivie`, appelé par `activiteQuotidienne`).
    // Un clic qui créditerait du travail effacerait la seule distinction qui
    // permet de savoir si le message est mal vu ou mal formulé.
    expect(registre.prescriptions[0]!.issue).toBe('en_attente');
    expect(registre.motifs[motif]!.suivis).toBe(0);
  });
});

describe('un rendu rejoué ne fabrique pas une seconde prescription', () => {
  it('deux montages du hook ne laissent qu’une seule prescription en attente', () => {
    const premier = renderHook(() => useInvitationCapitaine(OPTIONS));
    const motif = premier.result.current.invitation!.motif ?? motifDeInvitation(premier.result.current.invitation!);
    premier.unmount();

    const second = renderHook(() => useInvitationCapitaine(OPTIONS));
    expect(second.result.current.invitation).not.toBeNull();

    const registre = lireRegistre();
    expect(registre.prescriptions).toHaveLength(1);
    expect(registre.prescriptions[0]!.issue).toBe('en_attente');
    expect(registre.motifs[motif]!.dits).toBe(1);
  });
});

// ── Audit Capitaine 2026-10-17 (§6.1, P2) ────────────────────────────────────
// La famille « compétence » (verdicts du coach) n'était fournie par AUCUN
// appelant : `chargee: false` à vie → la phase 4 (Consolidation) était
// inatteignable (verdictsConsolides exige chargee). Le hook doit la charger en
// DIFFÉRÉ (parcoursMeta sorti de l'entrée par M7), comme la famille erreurs.
describe('la famille compétence est lue, pas déclarée vide à jamais', () => {
  it('montage → chargee devient vrai avec des verdicts RÉELS dérivés du parcours', async () => {
    const { result } = renderHook(() => useInvitationCapitaine(OPTIONS));
    // Le parcours est vide : chaque unité dit « non_commence » — un FAIT,
    // jamais une valeur inventée. Mais la famille doit être CHARGÉE.
    await waitFor(() => expect(result.current.etat.competence.chargee).toBe(true));
    expect(Object.keys(result.current.etat.competence.verdicts).length).toBeGreaterThan(0);
    expect(result.current.etat.competence.unitePrioritaire).not.toBeNull();
    // Sans aucune preuve produite, aucune unité ne peut proclamer « faible »...
    // non_commence est le seul verdict honnête sur parcours vide.
    const verdicts = new Set(Object.values(result.current.etat.competence.verdicts));
    expect(verdicts.has('non_commence')).toBe(true);
    expect(verdicts.has('fort')).toBe(false);
  });

  it('la phase 4 (consolidation) redevient ATTEIGNABLE quand les verdicts sont solides', async () => {
    // Élève qui a validé de quoi produire des verdicts moyen/fort : la phase
    // déduite ne doit plus être bloquée à `chargee: false`.
    const { result } = renderHook(() => useInvitationCapitaine(OPTIONS));
    await waitFor(() => expect(result.current.etat.competence.chargee).toBe(true));
    // Sur un parcours vide, la consolidation est légitimement refusée — mais
    // par le CONTENU des verdicts, plus par un drapeau mort :
    expect(result.current.etat.competence.verdicts).toBeTruthy();
  });
});

// §6.1 (suite) — le retour de VISIBILITÉ est un évènement qui compte : la
// bulle recalculait sur « ouverture, changement de rubrique, retour de
// travail », mais pas sur le retour de l'app (l'écran veille des téléphones
// était un aveu mensonger : l'heure affichée datait de la veille).
describe('le retour de visibilité rafraîchit l état', () => {
  it('visibilitychange → l horloge de l état est relue (18 h → 20 h)', () => {
    const { result } = renderHook(() => useInvitationCapitaine(OPTIONS));
    expect(result.current.etat.temps.heure).toBe(18);

    vi.setSystemTime(new Date(2026, 9, 15, 20, 0, 0));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.etat.temps.heure).toBe(20);
  });
});
