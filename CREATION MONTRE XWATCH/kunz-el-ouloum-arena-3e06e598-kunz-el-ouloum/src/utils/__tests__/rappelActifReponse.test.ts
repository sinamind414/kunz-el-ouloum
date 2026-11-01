// rappelActifReponse.test.ts — LA QUESTION DU TUTEUR A UNE RÉPONSE ÉCOUTÉE.
//
// BUG RÉEL, rapporté par l'utilisateur le 14/10/2026, recopié tel quel :
//
//   Le tuteur livre la fiche « تركيب البروتين (الاستنساخ والترجمة) » et termine
//   par : « صح أم خطأ: نسخ مرتبط مباشرةً بترجمة في هذا الدرس. أجب بكلمة واحدة. »
//   L'élève répond « صح ».
//   Le tuteur répond : « ❓ هذا السؤال خارج قاعدة علوم الطبيعة والحياة
//   للبكالوريا » — avec 0 % de confiance.
//
// Deux causes, les deux traitées ici :
//   · AUCUN état ne retenait qu'une question venait d'être posée. « صح » traversait
//     toute la cascade, ne partageait aucun mot avec le programme, et tombait dans
//     le détecteur de hors-sujet.
//   · La question « X مرتبط بـ Y » était construite sur les DEUX PREMIERS
//     mots-clés de la fiche — donc toujours vraie par construction, et impossible
//     à corriger si l'élève répondait « خطأ ».
import { describe, expect, it } from 'vitest';
import { processStudentInput } from '../../smartTutorEngine';
import { getDefaultSession, type BotSession } from '../sessionManager';
import { KNOWLEDGE_CARDS } from '../../data/smartBotData';

/** La fiche exacte de la capture d'écran. */
const FICHE = KNOWLEDGE_CARDS.find((c) => c.title.includes('تركيب البروتين'))!;

/** Session d'où part l'élève, avec le domaine déjà ouvert. */
const session = (): BotSession => ({ ...getDefaultSession(), activeDomainId: 1 });

/**
 * Livre la fiche réelle et renvoie l'action + la session qui en résulte.
 *
 * Le déclencheur est « الاستنساخ والترجمة » : c'est le chemin qui, dans
 * l'application, livre la fiche complète ET sa question de rappel — celui de la
 * capture d'écran. (La question de sondage KEO-103 mène au même état, en deux
 * temps ; ce chemin-là est vérifié séparément plus bas.)
 */
function livrerFiche() {
  return processStudentInput(session(), 'الاستنساخ والترجمة');
}

describe('la fiche existe et contient de quoi vérifier la réponse', () => {
  it('la fiche de la capture est bien dans le corpus', () => {
    expect(FICHE).toBeDefined();
    expect(FICHE.keywords.slice(0, 2)).toEqual(['نسخ', 'ترجمة']);
  });

  it('sa réponse courte relie RÉELLEMENT les deux mots-clés', () => {
    // C'est cette vérification qui autorise la question « صح أم خطأ » : sans une
    // phrase qui relie les deux termes, le tuteur ne peut ni juger ni expliquer.
    const phrase = FICHE.shortAnswer.split(/[.!?؟\n؛]+/).find(
      (p) => p.includes('نسخ') && p.includes('ترجمة'),
    );
    expect(phrase, 'aucune phrase ne relie نسخ et ترجمة : la question serait un faux exercice').toBeTruthy();
  });
});

describe('le tuteur livre la fiche ET retient qu’il a posé une question', () => {
  it('la question de rappel est bien posée', () => {
    const r = livrerFiche();
    expect(r.action.text).toContain('قبل أن ننتقل');
    expect(r.action.text).toContain('صح أم خطأ');
  });

  it('le chemin par la question de sondage pose le MÊME état', () => {
    // `buildAnswer` et la livraison directe sont deux portes vers la même fiche :
    // si une seule posait l'état, la moitié des élèves reverrait le bug.
    const apresSonde = processStudentInput(session(), 'الترجمة في الهيولى');
    if (apresSonde.action.text.includes('قبل أن ننتقل')) {
      expect(apresSonde.session.pendingRecallCardId).toBe(FICHE.id);
    }
  });

  it('la session mémorise la fiche en attente de réponse', () => {
    // SANS cette mémorisation, toute la suite échoue : c'est la cause racine.
    const r = livrerFiche();
    expect(r.session.pendingRecallCardId).toBe(FICHE.id);
  });
});

describe('LA RÉPONSE « صح » — le scénario exact rapporté', () => {
  it('« صح » ne renvoie PLUS « hors programme »', () => {
    const r = livrerFiche();
    const reponse = processStudentInput(r.session, 'صح');
    expect(reponse.action.text).not.toContain('خارج قاعدة');
    expect((reponse.action.sources ?? []).some((s) => s.type === 'out_of_scope')).toBe(false);
    // Le badge affiché à l'écran était « خارج المقرر » avec 0 % de confiance.
    expect(reponse.action.confidence).toBeGreaterThan(0);
  });

  it('elle est reconnue comme CORRECTE et confirmée par la phrase de la fiche', () => {
    const r = livrerFiche();
    const reponse = processStudentInput(r.session, 'صح');
    expect(reponse.action.text).toContain('صحيح');
    // La phrase montrée vient de la fiche, pas du moteur : « النسخ … ثم الترجمة ».
    expect(reponse.action.text).toContain('النسخ');
    expect(reponse.action.text).toContain('الترجمة');
  });

  it('« صحيح » et « نعم » sont acceptées comme « صح »', () => {
    for (const mot of ['صحيح', 'نعم', 'أجل']) {
      const reponse = processStudentInput(livrerFiche().session, mot);
      expect(reponse.action.text, mot).toContain('صحيح');
      expect(reponse.action.text, mot).not.toContain('خارج قاعدة');
    }
  });

  it('l’état est consommé : une seconde réponse ne rejoue pas le même verdict', () => {
    const premier = processStudentInput(livrerFiche().session, 'صح');
    expect(premier.session.pendingRecallCardId).toBeNull();
    const second = processStudentInput(premier.session, 'صح');
    // Nouvelle question posée par l'élève → on ne rejoue pas le verdict du rappel.
    expect(second.action.text).not.toContain('إن طابقت صياغتك');
  });
});

describe('l’élève qui se trompe est corrigé, avec la phrase de la fiche', () => {
  it('« خطأ » reçoit la correction, pas un « hors programme »', () => {
    const reponse = processStudentInput(livrerFiche().session, 'خطأ');
    expect(reponse.action.text).not.toContain('خارج قاعدة');
    // La correction est factuelle : elle vient de la fiche.
    expect(reponse.action.text).toContain('مرتبطان فعلًا');
    expect(reponse.action.text).toContain('النسخ');
  });

  it('« لا » est compris comme « faux » (et par mot entier, pas par sous-chaîne)', () => {
    const reponse = processStudentInput(livrerFiche().session, 'لا');
    expect(reponse.action.text).toContain('مرتبطان فعلًا');
  });

  it('un mot contenant « لا » ne déclenche PAS la correction', () => {
    // « السلام عليكم » contient « لا » : sans la comparaison par mot entier,
    // l'élève recevrait une correction qu'il n'a pas demandée.
    const reponse = processStudentInput(livrerFiche().session, 'السلام عليكم');
    expect(reponse.action.text).not.toContain('مرتبطان فعلًا');
    expect(reponse.action.text).not.toContain('خارج قاعدة');
  });

  it('une réponse libre est comparée à la phrase de la fiche (auto-évaluation)', () => {
    const reponse = processStudentInput(
      livrerFiche().session,
      'النسخ في النواة والترجمة في الهيولى على مستوى الريبوزوم',
    );
    expect(reponse.action.text).not.toContain('خارج قاعدة');
    expect(reponse.action.text).toContain('قارن بها');
  });
});

describe('le rappel ne bloque personne', () => {
  it('« العودة للقائمة الرئيسية » libère l’état et poursuit le flux', () => {
    const reponse = processStudentInput(livrerFiche().session, 'العودة للقائمة الرئيسية');
    // L'accueil réinitialise la session : plus aucune question en attente.
    expect(reponse.session.pendingRecallCardId ?? null).toBeNull();
    expect(reponse.action.text).not.toContain('إن طابقت صياغتك');
  });

  it('« راجع أخطائي السابقة » n’est PAS prise pour une réponse au rappel', () => {
    // Défaut trouvé en écrivant ce test : cette intention est traitée PLUS HAUT
    // dans la cascade que le bloc d'écoute du rappel. Sans le nettoyage en tête,
    // l'état restait armé après que l'élève a quitté la question — et sa saisie
    // suivante aurait reçu un verdict qui ne la concernait pas.
    const r1 = livrerFiche();
    expect(r1.session.pendingRecallCardId).toBe(FICHE.id);
    const r2 = processStudentInput(r1.session, 'راجع أخطائي السابقة');
    expect(r2.action.text).not.toContain('إن طابقت صياغتك');
    expect(r2.session.pendingRecallCardId ?? null).toBeNull();
  });

  it('aucune intention forte ne laisse un état armé derrière elle', () => {
    for (const intention of ['العودة للقائمة الرئيسية', 'راجع أخطائي السابقة', 'راجع تركيب البروتين']) {
      const r = processStudentInput(livrerFiche().session, intention);
      expect(r.session.pendingRecallCardId ?? null, intention).toBeNull();
    }
  });

  it('le tuteur ne termine jamais sa réponse au rappel par une question de plus', () => {
    // Le défaut d'origine était une question sans réponse possible. La réponse au
    // rappel ne doit pas en créer une seconde.
    const reponse = processStudentInput(livrerFiche().session, 'صح');
    expect(reponse.action.text.trim().endsWith('؟')).toBe(false);
  });
});

describe('hors contexte, une réponse courte n’est pas un hors-sujet', () => {
  it('« صح » seul demande une précision au lieu d’accuser un hors-programme', () => {
    // Même famille de défaut que le bug rapporté, sans question en attente : le
    // tuteur ne peut pas savoir à quoi l'élève répond. « هذا السؤال خارج قاعدة
    // علوم الطبيعة والحياة » était un non-sens devant deux lettres.
    for (const mot of ['صح', 'نعم', 'لا', 'خطأ']) {
      const r = processStudentInput(session(), mot);
      expect(r.action.text, mot).not.toContain('خارج قاعدة');
      expect(r.action.confidence, mot).toBeGreaterThan(0);
    }
  });

  it('un vrai hors-sujet reste refusé, même court s’il est listé', () => {
    // Le garde-fou ne doit pas ouvrir la porte au n'importe quoi : les questions
    // hors programme reconnues gardent leur refus (testé aussi côté lessonIndex).
    const r = processStudentInput(session(), 'من هو ميسي؟');
    expect(r.action.text).toContain('خارج قاعدة');
  });

  it('une VRAIE question courte du programme reste résolue normalement', () => {
    // « الغوص » fait 5 lettres : le garde-fou ne doit pas intercepter un mot-clé
    // du programme, qui est résolu bien plus haut dans la cascade.
    const r = processStudentInput(session(), 'الغوص');
    expect(r.action.text).not.toContain('ولا أعرف علامَ تجيب');
  });
});

describe('une question n’est jamais prise pour une réponse au rappel', () => {
  // Défaut trouvé en écrivant la correction elle-même : après avoir livré une
  // fiche, la question SUIVANTE de l'élève recevait le verdict du rappel. C'était
  // pire que le bug d'origine — répondre à côté à une vraie question.
  it('« ما هو الاستنساخ؟ » juste après la fiche n’est pas un verdict', () => {
    const apres = processStudentInput(livrerFiche().session, 'ما هو الاستنساخ؟');
    expect(apres.action.text).not.toContain('إن طابقت صياغتك');
    expect(apres.session.pendingRecallCardId ?? null).toBeNull();
  });

  it('« اشرح لي » n’est pas un verdict non plus', () => {
    // Après une livraison DIRECTE de fiche, « اشرح لي » repart dans la cascade
    // normale (la fiche est déjà là). La seule garantie qui compte ici : il
    // n'est pas pris pour une réponse au rappel, et l'état est libéré.
    // Le chemin par la question de sondage, lui, est verrouillé ailleurs
    // (morchidSocratique.test.ts : contournement journalisé, contenu livré).
    const apres = processStudentInput(livrerFiche().session, 'اشرح لي');
    expect(apres.action.text).not.toContain('إن طابقت صياغتك');
    expect(apres.session.pendingRecallCardId ?? null).toBeNull();
  });

  it('une vraie prise de position reste lue comme telle', () => {
    // Le filtre ne doit pas jeter la réponse attendue : « نعم » après la question
    // reste un verdict, pas une question déguisée.
    const apres = processStudentInput(livrerFiche().session, 'نعم');
    expect(apres.action.text).toContain('إن طابقت صياغتك');
  });
});

describe('« لا أعرف » n’est jamais lu comme un « faux »', () => {
  it('l’élève qui ne sait pas est aidé, pas jugé', () => {
    // « لا أعرف » CONTIENT le mot « لا » : le matching par mot entier le lisait
    // comme « faux » et lui opposait un démenti. C'est la faute typique du
    // correcteur automatique — répondre à la place de l'élève.
    for (const doute of ['لا أعرف', 'لا أدري', 'لا أعلم', 'لا أتذكر']) {
      const r = processStudentInput(livrerFiche().session, doute);
      expect(r.action.text, doute).not.toContain('في هذا الدرس هما مرتبطان فعلًا');
      expect(r.action.text, doute).not.toContain('✅ صحيح');
      expect(r.action.text, doute).toContain('لا أعرف');
    }
  });
});
