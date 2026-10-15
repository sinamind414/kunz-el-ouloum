// rappelEcheanceAdaptative.test.ts — L'ÉCHÉANCE DÉPEND DE LA RÉPONSE, DANS LE TUTEUR.
//
// Défaut réparé le 15/10/2026, et c'est celui que l'utilisateur a nommé :
// « ce n'est pas du SM-2 adaptatif, c'est une séquence fixe J+1/J+3/J+7/J+14 ; un
// vrai SM-2 ajusterait l'intervalle selon la réponse de l'élève. »
//
// Les deux moitiés du défaut :
//   · la séquence était fixe — l'intervalle ne dépendait que du NOMBRE de
//     passages, jamais de la qualité de ce qui avait été répondu ;
//   · dans le tuteur, le verdict du rappel était calculé puis JETÉ.
//     `reponseAuRappel` produisait « ✅ صحيح » et n'enregistrait rien : rien ne
//     reprogrammait jamais la fiche. Au sens strict, aucun rappel espacé
//     n'existait dans le tuteur.
import { afterEach, describe, expect, it } from 'vitest';
import { processStudentInput } from '../../smartTutorEngine';
import { getDefaultSession, type BotSession } from '../sessionManager';
import { KNOWLEDGE_CARDS } from '../../data/smartBotData';
import { etatRappel } from '../../lib/rappelAdaptatif';

const FICHE = KNOWLEDGE_CARDS.find((c) => c.title.includes('تركيب البروتين'))!;
const DECLENCHEUR = 'الاستنساخ والترجمة';

afterEach(() => {
  localStorage.clear();
});

/**
 * Rejoue n fois le cycle réel : le tuteur livre la fiche, l'élève répond.
 * Renvoie ce que le tuteur a répondu à chaque fois.
 */
function cycles(reponses: string[]): string[] {
  let session: BotSession = { ...getDefaultSession(), activeDomainId: 1 };
  const textes: string[] = [];
  for (const reponse of reponses) {
    session = processStudentInput(session, DECLENCHEUR).session;
    const r = processStudentInput(session, reponse);
    session = r.session;
    textes.push(r.action.text);
  }
  return textes;
}

describe('le tuteur annonce une échéance — ce qu’il ne faisait jamais', () => {
  it('après une réponse, l’élève apprend QUAND la fiche reviendra', () => {
    const [reponse] = cycles(['صح']);
    expect(reponse).toContain('أعيدها عليك');
    expect(reponse).toContain('غدًا');
    // Ce qui est annoncé est ce qui est mémorisé.
    expect(etatRappel(FICHE.id)?.intervalDays).toBe(1);
  });

  it('la première date est la même pour tous — c’est la définition de SM-2', () => {
    // « rép. 1 → 1 jour », quelle que soit la note. Le dire plutôt que de
    // prétendre à une adaptation qui n'existe qu'à partir de la 2e révision.
    const [parfait] = cycles(['صح']);
    localStorage.clear();
    const [rate] = cycles(['خطأ']);
    expect(parfait).toContain('غدًا');
    expect(rate).toContain('غدًا');
    // Mais la TRACE diffère déjà, et c'est elle qui décidera ensuite.
    expect(etatRappel(FICHE.id)?.lapses).toBe(1);
  });
});

describe('deux passés différents → deux échéances différentes', () => {
  it('deux réussites : la fiche s’espace à six jours', () => {
    const [, seconde] = cycles(['صح', 'صح']);
    expect(seconde).toContain('بعد 6 أيام');
    expect(etatRappel(FICHE.id)?.intervalDays).toBe(6);
  });

  it('un échec puis une réussite : la fiche revient le LENDEMAIN', () => {
    // Le même élève, la même réussite au second tour — mais il a échoué d'abord.
    // La séquence fixe aurait avancé son échéance comme celle de tout le monde ;
    // l'algorithme le fait revenir demain, parce que le cycle a redémarré.
    const [, seconde] = cycles(['خطأ', 'صح']);
    expect(seconde).toContain('غدًا');
    expect(seconde).not.toContain('بعد 6 أيام');
    expect(etatRappel(FICHE.id)?.intervalDays).toBe(1);
  });

  it('et l’écart entre les deux élèves est durable, pas cosmétique', () => {
    cycles(['صح', 'صح']);
    const solide = etatRappel(FICHE.id)!;
    localStorage.clear();
    cycles(['خطأ', 'صح']);
    const fragile = etatRappel(FICHE.id)!;
    // 2 réussites contre 1 échec + 1 réussite : l'élève fragile reviendra plus
    // tôt, et le restera même s'il réussit ensuite.
    expect(fragile.reps).toBeLessThan(solide.reps);
    expect(fragile.ease).toBeLessThan(solide.ease);
    expect(fragile.lapses).toBe(1);
    expect(solide.lapses).toBe(0);
  });
});

describe('les trois verdicts ne sont plus confondus', () => {
  it('« لا أعرف » n’est pas lu comme « خطأ » — la phrase le dit à l’élève', () => {
    const [reponse] = cycles(['لا أعرف']);
    expect(reponse).toContain('لا بأس');
    // Mais il compte bien comme un échec : dans les deux cas l'élève n'a rien
    // restitué. La différence est dans la difficulté déclarée, donc dans le
    // facteur de facilité.
    expect(etatRappel(FICHE.id)?.lapses).toBe(1);
    const incertain = etatRappel(FICHE.id)!.ease;
    localStorage.clear();
    cycles(['خطأ']);
    expect(incertain).toBeLessThan(etatRappel(FICHE.id)!.ease);
  });

  it('une réponse RÉDIGÉE est notée sur les mots-clés de la fiche', () => {
    // « النسخ والترجمة » contient deux mots-clés de la fiche, article compris —
    // c'est le cas que la comparaison littérale ratait avant le 15/10.
    const [reponse] = cycles(['النسخ والترجمة']);
    expect(reponse).not.toContain('خارج قاعدة');
    expect(reponse).toContain('أعيدها عليك');
    localStorage.clear();
    cycles(['لا أعرف']);
    const nulle = etatRappel(FICHE.id)!;
    // Une réponse qui nomme les deux notions laisse une meilleure trace qu'un
    // « je ne sais pas ».
    localStorage.clear();
    cycles(['النسخ والترجمة']);
    expect(etatRappel(FICHE.id)!.ease).toBeGreaterThan(nulle.ease);
  });
});

describe('ce qui ne doit pas avoir changé', () => {
  it('un « صح » seul sans question en attente reste une réponse orpheline', () => {
    const r = processStudentInput({ ...getDefaultSession(), activeDomainId: 1 }, 'صح');
    expect(r.action.text).toContain('وصلتني');
    expect(r.action.text).not.toContain('خارج قاعدة');
  });

  it('la fiche reste servie normalement, avec sa question de rappel', () => {
    const r = processStudentInput({ ...getDefaultSession(), activeDomainId: 1 }, DECLENCHEUR);
    expect(r.action.text).toContain('صح أم خطأ');
    expect(r.session.pendingRecallCardId).toBe(FICHE.id);
  });
});
