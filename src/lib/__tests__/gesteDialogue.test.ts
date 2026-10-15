// src/lib/__tests__/gesteDialogue.test.ts — verrous du module PUR de gestes.
//
// Le défaut mesuré le 14/10/2026 : 10 gestes humains sur 11 recevaient
// « ❓ هذا السؤال خارج قاعدة علوم الطبيعة والحياة ». Ces tests fixent les deux
// moitiés du contrat :
//   · un geste humain est TOUJOURS reconnu ;
//   · une question de cours n'est JAMAIS prise pour un geste.
import { describe, expect, it } from 'vitest';
import { gesteDuMessage } from '../gesteDialogue';
import { GESTES_DIALOGUE } from '../../data/gestesDialogue';
import { normalizeArabic } from '../../utils/arabicNormalize';

/** Aucun sujet du programme nommé : c'est le cas de tous les gestes mesurés. */
const sansSujet = () => false;
/** L'élève nomme un thème du programme. */
const avecSujet = () => true;

const id = (s: string, nomme = sansSujet) => gesteDuMessage(normalizeArabic(s), nomme)?.id ?? null;

describe('chaque geste mesuré est reconnu', () => {
  const CAS: Array<[string, string]> = [
    ['السلام عليكم', 'salutation'],
    ['صباح الخير', 'salutation'],
    ['مرحبا', 'salutation'],
    ['شكرا', 'remerciement'],
    ['بارك الله فيك', 'remerciement'],
    ['يعطيك الصحة', 'remerciement'],
    ['مافهمت والو', 'incomprehension'],
    ['ما فهمتش', 'incomprehension'],
    ['مانيش فاهم', 'incomprehension'],
    ['أعد من فضلك', 'repete'],
    ['عاودلي', 'repete'],
    ['ما سمعتك', 'repete'],
    ['اشرح لي ببساطة', 'simplifie'],
    ['خطوة بخطوة', 'simplifie'],
    ['أعطني مثال', 'exemple'],
    ['حل مثال', 'exemple'],
    ['رسبت في الفرض', 'echec'],
    ['مانجحتش', 'echec'],
    ['كيفاش ندير', 'ou_commencer'],
    ['من أين أبدأ', 'ou_commencer'],
    ['بسلامة', 'adieu'],
    ['إلى اللقاء', 'adieu'],
  ];

  for (const [saisie, attendu] of CAS) {
    it(`« ${saisie} » → ${attendu}`, () => {
      expect(id(saisie)).toBe(attendu);
    });
  }
});

describe('une question de cours n’est jamais un geste', () => {
  const QUESTIONS = [
    'شكرا، لكن ما هي العلاقة بين النسخ والترجمة؟',
    'ما فهمتش كيفاش يدخل الـ ARNt إلى الريبوزوم',
    'أعطني مثال على الانزيمات التنافسية',
    'اشرح لي ببساطة كيف تتشكل الجبال',
  ];

  for (const q of QUESTIONS) {
    it(`« ${q} »`, () => {
      expect(id(q, avecSujet)).toBeNull();
    });
  }
});

describe('les garde-fous de forme', () => {
  it('une saisie trop courte ne déclenche rien', () => {
    expect(id('ا')).toBeNull();
    expect(id('شك')).toBeNull();
  });

  it('un geste long et bavard n’est plus un geste — sauf pour saluer et partir', () => {
    const bavard = 'أعطني مثال على شيء ما في الدرس الذي كنا نتحدث عنه منذ قليل والذي لم أفهمه بعد';
    expect(id(bavard)).toBeNull();
    // Saluer tient en deux mots, mais une phrase entière de politesse reste une
    // politesse : on ne refuse pas un élève qui prend congé poliment.
    const longueAdieu = 'شكرا على كل شيء يا أستاذ، بسلامة والى اللقاء قريبا بإذن الله';
    expect(id(longueAdieu)).toBe('adieu');
  });
});

describe('les données elles-mêmes', () => {
  it('aucune famille ne repose sur un déclencheur vide', () => {
    for (const g of GESTES_DIALOGUE) {
      expect(g.declencheurs.length, g.id).toBeGreaterThan(0);
      for (const d of g.declencheurs) expect(d.trim().length, `${g.id}: ${d}`).toBeGreaterThan(1);
    }
  });

  it('chaque réponse est un vrai message, et chaque famille garde son identité', () => {
    const ids = GESTES_DIALOGUE.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const g of GESTES_DIALOGUE) {
      expect(g.reponseAr.length, g.id).toBeGreaterThan(40);
      // Une réponse de tuteur ramène TOUJOURS à une action : c'est la règle du
      // guide (attirer → guider → faire chercher → faire répondre).
      expect(g.reponseAr, g.id).toContain('👉');
    }
  });

  it('la sortie reste en فصحى : jamais de darija recopiée de l’élève', () => {
    // Règle AGENTS.md n° 5 : la darija sert à COMPRENDRE, jamais à répondre.
    const darijaSortie = ['واش', 'كيفاش', 'راني', 'مافهمتش', 'عيان', 'بصح'];
    for (const g of GESTES_DIALOGUE) {
      for (const mot of darijaSortie) {
        expect(normalizeArabic(g.reponseAr).includes(mot), `${g.id} / ${mot}`).toBe(false);
      }
    }
  });
});
