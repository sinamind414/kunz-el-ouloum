// capitaine.test.ts — LE GUIDE DIRAIT-IL N'IMPORTE QUOI ?
//
// Trois familles de vérifications :
//   1. la voix ne dérive pas de la méthode VERROUILLÉE (MARQUE.md §14) ;
//   2. chaque situation dit à l'élève CE QU'IL DOIT FAIRE, pas « bravo » ;
//   3. la personnalisation ne parle que quand elle sait quelque chose.
import { describe, expect, it } from 'vitest';
import {
  CAPITAINE_IDENTITE_AR,
  CAPITAINE_NOM_AR,
  CEINTURE_CHECKS_AR,
  CHAINE_METHODE_AR,
  GESTES_ATTENDUS_AR,
  MESSAGES_CAPITAINE,
  messageCapitaine,
  messagePersonnalise,
  rappelChaineAr,
  type SituationCapitaine,
} from '../capitaine';
import { STEP_NAMES_AR } from '../methodologyEngine';
import { SELF_CHECKS } from '../boussoleData';

describe('la voix est alignée sur la méthode VERROUILLÉE, pas sur une invention', () => {
  it('les quatre gestes sont فعل · دليل · علاقة · جواب', () => {
    // MARQUE.md §14 (décision owner 2026-09-22) : 1 فعل 🔍 · 2 دليل 🔑 ·
    // 3 علاقة 🔄 · 4 جواب 🔓. Ce test échouera si quelqu'un réécrit la chaîne
    // « فعل → دليل → جواب → فحص » (demande du 14/10/2026) sans changer la
    // décision de marque : c'est exactement ce qu'il doit faire.
    expect(GESTES_ATTENDUS_AR).toEqual(['فعل', 'دليل', 'علاقة', 'جواب']);
    expect(CHAINE_METHODE_AR).toEqual(['فعل', 'دليل', 'علاقة', 'جواب']);
  });

  it('la chaîne est LUE depuis le moteur (aucune copie qui puisse dériver)', () => {
    expect(CHAINE_METHODE_AR[0]).toBe(STEP_NAMES_AR[1]);
    expect(CHAINE_METHODE_AR[1]).toBe(STEP_NAMES_AR[2]);
    expect(CHAINE_METHODE_AR[2]).toBe(STEP_NAMES_AR[3]);
    expect(CHAINE_METHODE_AR[3]).toBe(STEP_NAMES_AR[4]);
  });

  it('« فحص » est la CEINTURE, jamais un cinquième geste', () => {
    // §14 : « le 5ᵉ geste v6 n'a PAS de dent » — option α. Le faire apparaître
    // dans la chaîne des quatre gestes serait la régression exacte refusée.
    expect(CHAINE_METHODE_AR).not.toContain('فحص');
    expect(CEINTURE_CHECKS_AR).toEqual(SELF_CHECKS);
    expect(CEINTURE_CHECKS_AR.length).toBeGreaterThan(0);
  });

  it('le nom du personnage n’est PAS celui de la méthode', () => {
    // « المفتاح » = la méthode et le produit (MARQUE.md §2, MIFTAH_NAME_AR).
    // Un personnage qui porte ce nom ferait que le guide EST la méthode.
    expect(CAPITAINE_NOM_AR).not.toBe('المفتاح');
    expect(CAPITAINE_NOM_AR).not.toContain('مفتاح');
    // « حامل المفتاح » et « أمين الكنز » sont déjà des badges du récit.
    expect(CAPITAINE_IDENTITE_AR).not.toContain('حامل المفتاح');
    expect(CAPITAINE_IDENTITE_AR).not.toContain('أمين الكنز');
  });

  it('l’identité est construite à partir du nom (une seule source)', () => {
    expect(CAPITAINE_IDENTITE_AR).toContain(CAPITAINE_NOM_AR);
  });

  it('rappelChaineAr() affiche la chaîne dans le bon ordre', () => {
    expect(rappelChaineAr()).toBe('فعل → دليل → علاقة → جواب');
  });
});

describe('chaque situation dit quoi faire', () => {
  const situations = Object.keys(MESSAGES_CAPITAINE) as SituationCapitaine[];

  it('toutes les situations de la demande existent', () => {
    for (const s of [
      'accueil',
      'avantExercice',
      'pendantResolution',
      'erreur',
      'revision',
      'examenEnCours',
      'examenTermine',
    ] as SituationCapitaine[]) {
      expect(situations, s).toContain(s);
    }
  });

  it('aucun message n’est vide, et chacun a un geste attendu', () => {
    for (const s of situations) {
      expect(MESSAGES_CAPITAINE[s].ar.trim().length, s).toBeGreaterThan(10);
      expect(MESSAGES_CAPITAINE[s].attenduAr.trim().length, `${s} (attendu)`).toBeGreaterThan(10);
    }
  });

  it('aucun message ne se contente de féliciter', () => {
    // Un guide qui dit « bravo » sans nommer le geste n'apprend rien. On
    // interdit les formules creuses, pas l'encouragement — « أخطأت، وهذا جيد »
    // est un encouragement, et il dit quoi faire ensuite.
    const creux = ['أحسنت', 'ممتاز', 'رائع', 'بالتوفيق', 'good luck'];
    for (const s of situations) {
      for (const mot of creux) {
        expect(MESSAGES_CAPITAINE[s].ar, `${s} contient « ${mot} »`).not.toContain(mot);
      }
    }
  });

  it('la situation « erreur » nomme l’erreur comme une information, pas comme un échec', () => {
    // C'est le principe 2 de la vidéo (faire ami avec la douleur d'avoir tort) :
    // l'erreur dit OÙ travailler.
    expect(MESSAGES_CAPITAINE.erreur.ar).toContain('أخطأت');
    expect(MESSAGES_CAPITAINE.erreur.ar).toContain('جيد');
  });

  it('la situation « examenEnCours » annonce un silence VOULU', () => {
    // Sans cette phrase, la disparition du bouton pendant l'épreuve passe pour
    // une panne — et l'élève cherche à la contourner.
    expect(MESSAGES_CAPITAINE.examenEnCours.ar).toContain('صامت');
    expect(MESSAGES_CAPITAINE.examenEnCours.ar).toContain('مقصود');
  });

  it('la situation « pendantResolution » renvoie à la DOCUMENT, pas à la mémoire', () => {
    expect(MESSAGES_CAPITAINE.pendantResolution.ar).toContain('الوثيقة');
  });

  it('la situation « avantExercice » demande le verbe ET le document', () => {
    expect(MESSAGES_CAPITAINE.avantExercice.ar).toContain('الفعل');
    expect(MESSAGES_CAPITAINE.avantExercice.ar).toContain('الدليل');
  });
});

describe('personnalisation : parler seulement quand on sait quelque chose', () => {
  it('sans profil, aucun message personnalisé', () => {
    expect(messagePersonnalise(null)).toBeNull();
    expect(messagePersonnalise({ codeDominant: null, nomAr: null, occurrences: 0, contreMesureAr: null })).toBeNull();
  });

  it('avec UNE seule occurrence, le guide se tait (une fois, c’est le hasard)', () => {
    expect(
      messagePersonnalise({
        codeDominant: 'missing_unit',
        nomAr: 'غياب الوحدة القياسية',
        occurrences: 1,
        contreMesureAr: 'x',
      }),
    ).toBeNull();
  });

  it('à partir de deux occurrences, il nomme l’erreur, son compte et la contre-mesure', () => {
    const m = messagePersonnalise({
      codeDominant: 'premature_interpretation',
      nomAr: 'تفسير مبكر أثناء التحليل',
      occurrences: 3,
      contreMesureAr: 'احذف أي تفسير واكتفِ بوصف ما تراه العين.',
    });
    expect(m).toContain('تفسير مبكر أثناء التحليل');
    expect(m).toContain('3');
    expect(m).toContain('احذف أي تفسير');
  });

  it('un profil sans contre-mesure reste utilisable (pas de « undefined » affiché)', () => {
    const m = messagePersonnalise({
      codeDominant: 'missing_unit',
      nomAr: 'غياب الوحدة القياسية',
      occurrences: 2,
      contreMesureAr: null,
    });
    expect(m).toContain('غياب الوحدة القياسية');
    expect(m).not.toContain('undefined');
    expect(m).not.toContain('null');
  });

  it('messageCapitaine personnalise « erreur » et « reprise », et RIEN d’autre', () => {
    const profil = {
      codeDominant: 'verb_confusion',
      nomAr: 'الخلط بين أفعال الأداء',
      occurrences: 4,
      contreMesureAr: 'افحص الفعل في بداية التعليمة.',
    };
    expect(messageCapitaine('erreur', profil).ar).toContain('الخلط بين أفعال الأداء');
    expect(messageCapitaine('reprise', profil).ar).toContain('الخلط بين أفعال الأداء');
    // Au début d'un exercice, on ne parle pas des erreurs du mois dernier :
    // le geste du moment prime.
    expect(messageCapitaine('avantExercice', profil).ar).toBe(MESSAGES_CAPITAINE.avantExercice.ar);
    expect(messageCapitaine('accueil', profil).ar).toBe(MESSAGES_CAPITAINE.accueil.ar);
    expect(messageCapitaine('examenEnCours', profil).ar).toBe(MESSAGES_CAPITAINE.examenEnCours.ar);
  });

  it('messageCapitaine sans profil rend le message de base', () => {
    expect(messageCapitaine('erreur').ar).toBe(MESSAGES_CAPITAINE.erreur.ar);
    expect(messageCapitaine('erreur', null).ar).toBe(MESSAGES_CAPITAINE.erreur.ar);
  });
});
