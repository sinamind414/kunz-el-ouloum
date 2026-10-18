// relais.test.ts — LE RELAIS HUMAIN, ET LES QUATRE CHOSES QU'IL NE DOIT JAMAIS FAIRE.
//
// L'étape 5 est la première du §9 qui parle d'un HUMAIN, et c'est pour cela
// qu'elle a été la dernière autorisée. Quatre propriétés sont verrouillées ici,
// dans l'ordre d'importance :
//
//   1. IL N'A AUCUNE CONSÉQUENCE. Nommer quelqu'un, répondre oui, répondre non,
//      refuser : aucun compteur de la boucle ne bouge d'un chiffre. Toute l'étape 1
//      repose sur des mesures qui ne valent que si l'élève dit la vérité ; le jour
//      où parler à un humain change un chiffre affiché, l'élève calcule au lieu de
//      répondre.
//   2. LA QUESTION SE POSE UNE FOIS. Une seule date de naissance par question,
//      même relue dix fois. Et un refus vaut pour toujours.
//   3. LA RELANCE ATTEND. Jamais le jour même, jamais moins de huit heures : un
//      « هل تحدثت إليه ؟ » posé dans la minute garantirait un « لا » qui ne veut
//      rien dire.
//   4. RIEN NE SORT. Le nom vit sous sa propre clé, et il s'efface.
import { beforeEach, describe, expect, it } from 'vitest';
import {
  LONGUEUR_NOM_MAX,
  QUESTION_RELAIS_AR,
  RELAIS_VIDE,
  lireRelais,
  marquerDemandePosee,
  marquerRelancePosee,
  nommerRelais,
  phraseRelanceAr,
  questionDuRelais,
  refuserLeRelais,
  repondreAuRelais,
  type Relais,
} from '../relais';
import { echecsParMotif, lireRegistre } from '../prescriptions';

const CLE = 'boussole_relais_v1';

/** Dates construites en heure LOCALE : `jourLocal` ne dépend pas du fuseau du CI. */
const J15_10H = new Date(2026, 9, 15, 10, 0, 0).getTime();
const J15_20H = new Date(2026, 9, 15, 20, 0, 0).getTime();
const J15_23H50 = new Date(2026, 9, 15, 23, 50, 0).getTime();
const J16_00H10 = new Date(2026, 9, 16, 0, 10, 0).getTime();
const J16_09H = new Date(2026, 9, 16, 9, 0, 0).getTime();
const J16_23H = new Date(2026, 9, 16, 23, 0, 0).getTime();

const avec = (over: Partial<Relais>): Relais => ({ ...RELAIS_VIDE, ...over });

beforeEach(() => {
  localStorage.clear();
});

describe('la nomination — elle se pose UNE fois, puis elle attend', () => {
  it('sans motif retiré, il n’y a rien à demander : le capitaine n’a pas encore renoncé', () => {
    expect(questionDuRelais({ relais: RELAIS_VIDE, unMotifEstRetire: false, maintenantMs: J15_10H })).toBeNull();
  });

  it('avec un motif retiré, la question est exactement celle qui a été arrêtée', () => {
    const q = questionDuRelais({ relais: RELAIS_VIDE, unMotifEstRetire: true, maintenantMs: J15_10H });
    expect(q).toEqual({ genre: 'nomination', questionAr: QUESTION_RELAIS_AR });
  });

  it('posée et sans réponse, elle reste posée — telle quelle, jamais reformulée', () => {
    const relais = avec({ demandeMs: J15_10H });
    const q = questionDuRelais({ relais, unMotifEstRetire: true, maintenantMs: J16_09H });
    expect(q).toEqual({ genre: 'nomination', questionAr: QUESTION_RELAIS_AR });
  });

  it('marquerDemandePosee est idempotent : une question n’a qu’une date de naissance', () => {
    marquerDemandePosee(J15_10H);
    marquerDemandePosee(J16_09H);
    expect(lireRelais().demandeMs).toBe(J15_10H);
  });

  it('un refus vaut pour toujours, même avec un motif retiré', () => {
    refuserLeRelais(J15_10H);
    expect(questionDuRelais({ relais: lireRelais(), unMotifEstRetire: true, maintenantMs: J16_09H })).toBeNull();
    expect(questionDuRelais({ relais: lireRelais(), unMotifEstRetire: true, maintenantMs: J15_10H })).toBeNull();
  });

  it('un nom écrit ferme la nomination, MÊME si la date d’affichage manque', () => {
    // Défaut trouvé par la démonstration du 15/10/2026, pas par les tests : le
    // banc mettait toujours `demandeMs` avant d'écrire le nom, parce que
    // l'interface le fait ainsi. Une règle ne doit pas dépendre de l'ordre
    // d'écriture de l'interface — ici, `demandeMs` manque et un nom existe.
    const orphelin = avec({ nom: 'زميلي', nommeMs: J15_10H });
    const q = questionDuRelais({ relais: orphelin, unMotifEstRetire: true, maintenantMs: J16_09H });
    expect(q, 'la nomination a été reposée alors qu’un nom existe').toEqual({
      genre: 'relance',
      nom: 'زميلي',
      questionAr: phraseRelanceAr('زميلي'),
    });
  });

  it('le refus efface le nom : ce qui a été confié n’est pas gardé contre la volonté', () => {
    nommerRelais('أستاذي', J15_10H);
    marquerDemandePosee(J15_10H);
    refuserLeRelais(J16_09H);
    expect(lireRelais().nom).toBeNull();
    expect(lireRelais().refusMs).toBe(J16_09H);
  });
});

describe('la relance — le lendemain, et pas avant huit heures', () => {
  const nomme = (ms: number): Relais => {
    nommerRelais('أستاذي', ms);
    marquerDemandePosee(ms - 3_600_000);
    return lireRelais();
  };

  it('jamais le jour même : la conversation n’a pas encore pu avoir lieu', () => {
    const relais = nomme(J15_10H);
    expect(questionDuRelais({ relais, unMotifEstRetire: true, maintenantMs: J15_20H })).toBeNull();
  });

  it('jamais moins de huit heures, même si le jour a changé', () => {
    // Nommé à 23 h 50, l'application rouverte à 00 h 10 : c'est bien « le
    // lendemain », et poser la question vingt minutes plus tard serait absurde.
    const relais = nomme(J15_23H50);
    expect(questionDuRelais({ relais, unMotifEstRetire: true, maintenantMs: J16_00H10 })).toBeNull();
  });

  it('le lendemain et après huit heures : la relance, avec le nom et rien d’autre', () => {
    const relais = nomme(J15_23H50);
    const q = questionDuRelais({ relais, unMotifEstRetire: true, maintenantMs: J16_09H });
    expect(q).toEqual({ genre: 'relance', nom: 'أستاذي', questionAr: phraseRelanceAr('أستاذي') });
  });

  it('la phrase contient le nom — et c’est la phrase arrêtée, au caractère près', () => {
    expect(phraseRelanceAr('أستاذي')).toBe('هل تحدثت إلى أستاذي ؟');
  });

  it('une réponse — oui ou non — ferme la question pour toujours', () => {
    nomme(J15_23H50);
    marquerRelancePosee(J16_09H);
    repondreAuRelais('non');
    expect(lireRelais().reponse).toBe('non');
    expect(questionDuRelais({ relais: lireRelais(), unMotifEstRetire: true, maintenantMs: J16_23H })).toBeNull();

    localStorage.clear();
    const autre = nomme(J15_23H50);
    expect(questionDuRelais({ relais: autre, unMotifEstRetire: true, maintenantMs: J16_09H })).not.toBeNull();
    repondreAuRelais('oui');
    expect(questionDuRelais({ relais: lireRelais(), unMotifEstRetire: true, maintenantMs: J16_23H })).toBeNull();
  });

  it('marquerRelancePosee est idempotent, comme la nomination', () => {
    nommerRelais('زميلي', J15_23H50);
    marquerRelancePosee(J16_09H);
    marquerRelancePosee(J16_23H);
    expect(lireRelais().relanceMs).toBe(J16_09H);
  });
});

describe('le stockage — tolérant, borné, et sans invention', () => {
  it('une clé absente rend un relais vide, jamais une exception', () => {
    expect(lireRelais()).toEqual(RELAIS_VIDE);
  });

  it('une valeur illisible rend un relais vide', () => {
    localStorage.setItem(CLE, '{ceci n’est pas du JSON');
    expect(lireRelais()).toEqual(RELAIS_VIDE);
    localStorage.setItem(CLE, JSON.stringify({ nom: 42, demandeMs: 'hier', reponse: 'peut-être' }));
    expect(lireRelais()).toEqual(RELAIS_VIDE);
  });

  it('un nom vide ou blanc ne remplace jamais un nom écrit', () => {
    nommerRelais('أستاذي', J15_10H);
    nommerRelais('   ', J15_20H);
    expect(lireRelais().nom).toBe('أستاذي');
  });

  it('un nom trop long est tronqué, il n’est pas refusé', () => {
    nommerRelais('ا'.repeat(LONGUEUR_NOM_MAX + 20), J15_10H);
    expect(lireRelais().nom?.length).toBe(LONGUEUR_NOM_MAX);
  });
});

describe('la conséquence : AUCUNE — le registre de la boucle ne bouge pas d’un chiffre', () => {
  it('nommer, répondre, refuser : le registre et les compteurs d’échecs restent identiques', () => {
    // Un motif réellement en échec, dans le vrai registre de la boucle.
    localStorage.setItem(
      'boussole_prescriptions_v1',
      JSON.stringify({
        prescriptions: [
          { motif: 'erreur:methodology', cible: 'methodology', emisMs: J15_10H, issue: 'ignoree', resoluMs: J15_10H },
        ],
        motifs: { 'erreur:methodology': { dits: 1, suivis: 0, ignores: 1, expires: 0 } },
      }),
    );
    const avant = JSON.stringify(lireRegistre(J16_09H));
    const avantEchecs = JSON.stringify(echecsParMotif(lireRegistre(J16_09H)));

    marquerDemandePosee(J16_09H);
    nommerRelais('أستاذي', J16_09H);
    marquerRelancePosee(J16_09H);
    repondreAuRelais('non');
    refuserLeRelais(J16_23H);

    expect(JSON.stringify(lireRegistre(J16_23H))).toBe(avant);
    expect(JSON.stringify(echecsParMotif(lireRegistre(J16_23H)))).toBe(avantEchecs);
  });

  it('le relais n’écrit que sa propre clé — aucune autre n’est touchée', () => {
    localStorage.setItem('boussole_erreurs_fermees', '[]');
    marquerDemandePosee(J15_10H);
    nommerRelais('زميلي', J15_10H);
    repondreAuRelais('oui');
    expect(localStorage.getItem('boussole_erreurs_fermees')).toBe('[]');
    expect(localStorage.getItem('boussole_relais_v1')).not.toBeNull();
  });
});
