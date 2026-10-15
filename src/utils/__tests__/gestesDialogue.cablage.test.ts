// src/utils/__tests__/gestesDialogue.cablage.test.ts — verrou de CÂBLAGE.
//
// Le module `gesteDialogue.ts` sait reconnaître un geste humain ; les tests de
// `src/lib/__tests__/gesteDialogue.test.ts` le prouvent. Ceux-ci prouvent qu'il
// est BRANCHÉ — au bon endroit de la cascade, et sans voler la place du contenu.
//
// C'est le défaut le plus stupéfiant du moteur avant ce correctif : « السلام
// عليكم », « شكرا », « مافهمت والو » ou « أعد من فضلك » recevaient
// « ❓ هذا السؤال خارج قاعدة علوم الطبيعة والحياة للبكالوريا ». Un élève qui
// dit bonjour s'entendait répondre qu'il est hors sujet.
import { describe, expect, it } from 'vitest';
import { processStudentInput } from '../../smartTutorEngine';
import { getDefaultSession } from '../sessionManager';

const session = () => ({ ...getDefaultSession(), activeDomainId: 1 });

const REFUS = 'خارج قاعدة';

describe('un geste humain n’est jamais déclaré hors programme', () => {
  const GESTES = [
    'السلام عليكم',
    'صباح الخير',
    'مرحبا',
    'شكرا',
    'بارك الله فيك',
    'أنا تعبان',
    'راني عيان',
    'مافهمت والو',
    'ما فهمتش',
    'أعد من فضلك',
    'عاودلي',
    'اشرح لي ببساطة',
    'أعطني مثال',
    'رسبت في الفرض',
    'كيفاش ندير',
    'لا أعرف من أين أبدأ',
    'بسلامة',
    'مع السلامة',
    'لا أعرف',
    'أنا خايف من الباك',
  ];

  for (const geste of GESTES) {
    it(`« ${geste} »`, () => {
      const r = processStudentInput(session(), geste);
      expect(r.action.text, `「${geste}」 → ${r.action.text.slice(0, 90)}`).not.toContain(REFUS);
      expect(r.action.text).not.toContain('المجالات الثلاثة');
    });
  }
});

// Re-vérification Morchid v3 (15/10/2026, M5) : la FATIGUE n'est pas de
// l'ANXIÉTÉ. « أنا تعبان », « راني عيان », « راسي يوجعني » recevaient le message
// sur le trac du Bac (« القلق قبل البكالوريا طبيعي »). Un élève fatigué a besoin
// d'une action (finir la carte en cours, s'arrêter) — pas d'un discours sur la
// peur. Les formes de fatigue vivent désormais dans gestesDialogue.ts (module
// testable), plus dans le lexique interne du moteur.
describe('fatigue ≠ anxiété — le corps n’est pas la panique', () => {
  const FATIGUES = ['أنا تعبان', 'راني عيان', 'راسي يوجعني', 'مانيش مركز', 'تعبت'];

  for (const saisie of FATIGUES) {
    it(`« ${saisie} » → réponse de fatigue, pas le discours d’anxiété`, () => {
      const r = processStudentInput(session(), saisie);
      expect(r.action.text, `「${saisie}」 → ${r.action.text.slice(0, 90)}`)
        .not.toContain('القلق قبل البكالوريا');
      expect(r.action.text).toContain('التعب');
      expect(r.action.text).toContain('👉');
    });
  }

  it('et la peur, elle, reçoit toujours la réponse d’anxiété', () => {
    const r = processStudentInput(session(), 'أنا خايف من الباك');
    expect(r.action.text).toContain('القلق قبل البكالوريا');
  });
});

// Morchid v4b (15/10/2026, « partiel ») : « لا أعرف » écrit À FROID — premier
// message d'un élève perdu, sans sonde en attente — recevait « خارج قاعدة ».
// En dialogue (sonde active) l'aveu est honoré ; à froid il doit guider vers
// un point de départ, jamais refuser.
describe('aveu à froid — l’élève perdu n’est jamais déclaré hors programme', () => {
  const AVEUX_FROIDS = ['لا أعرف', 'ماعرفتش', 'لا ادري'];

  for (const saisie of AVEUX_FROIDS) {
    it(`« ${saisie} » (premier message) → un point de départ, pas un refus`, () => {
      const r = processStudentInput(getDefaultSession(), saisie);
      expect(r.action.text, `「${saisie}」 → ${r.action.text.slice(0, 90)}`)
        .not.toContain('خارج قاعدة');
      expect(r.action.text).toContain('ابدأ');
    });
  }
});

describe('le geste est traité comme un geste, pas comme du contenu', () => {  it('« مافهمت والو » demande où est l’obstacle', () => {
    const r = processStudentInput(session(), 'مافهمت والو');
    expect(r.action.text).toContain('موضع العقدة');
  });

  it('« أعد من فضلك » ne fait pas semblant de se souvenir', () => {
    // Un tuteur qui prétend répéter alors qu'il ne garde pas le fil est pire
    // qu'un tuteur qui le dit : l'élève attend une réponse qui ne viendra jamais.
    const r = processStudentInput(session(), 'أعد من فضلك');
    expect(r.action.text).toContain('لا أحتفظ به');
  });

  it('« شكرا » ne déclenche pas une flatterie mais une preuve', () => {
    const r = processStudentInput(session(), 'شكرا');
    expect(r.action.text).toContain('ذاكرتك');
  });

  it('un geste propose toujours une action concrète', () => {
    for (const geste of ['شكرا', 'مافهمت والو', 'أعطني مثال', 'رسبت في الفرض']) {
      const r = processStudentInput(session(), geste);
      expect(r.action.quickActions?.length ?? 0, geste).toBeGreaterThan(0);
    }
  });
});

describe('le contenu garde la priorité sur la forme', () => {
  it('une question de cours qui commence par « شكرا » reste une question', () => {
    const r = processStudentInput(session(), 'شكرا، لكن ما هي العلاقة بين النسخ والترجمة؟');
    expect(r.action.text).not.toContain('ذاكرتك');
    expect(r.action.sources?.length ?? 0).toBeGreaterThan(0);
  });

  it('une demande de simplification QUI NOMME UN SUJET n’est pas un geste', () => {
    // Défaut trouvé en écrivant la couche : le premier garde-fou (« la saisie
    // contient-elle du vocabulaire des cours ? ») laissait passer ce cas, car
    // « اشرح » figure dans un titre de leçon. L'élève recevait alors une leçon
    // sur la chromatographie de la phase photochimique.
    const r = processStudentInput(session(), 'اشرح لي ببساطة كيف تتشكل الجبال');
    expect(r.action.text).not.toContain('جملة البطاقة');
    expect(r.action.text).not.toContain('الكروماتوغرافية');
  });

  it('l’incompréhension qui nomme un sujet reste une question', () => {
    const r = processStudentInput(session(), 'ما فهمتش كيفاش يدخل ARNt إلى الريبوزوم');
    expect(r.action.text).not.toContain('موضع العقدة');
  });
});
