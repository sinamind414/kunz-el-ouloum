// Verrou de contenu T1 — normalisation inter-banques (audit tuteur 2026-11-07,
// recos 4 et 7, GO propriétaire). Règle associée : aucune donnée générée n'est
// éditée à la main, et aucun chiffre officiel n'est inventé ; chaque correction
// ci-dessous est ancrée à une preuve du corpus commentée en tête de test.
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { BOOK_TUTOR_QA } from '../../bookTutorQA';
import { KNOWLEDGE_CARDS } from '../../data/smartBotData';

// Fiche enzyme (المفتاح والقفل = 1× dans le corpus leçons HTML ; le mécanisme
// induit est nommé « التوافق المحرض » (2×) dans les opuscules, jamais
// « التوافق المستحث » — compter sur dist/tutor/knowledge.json `content`).
describe('fiche enzyme_activity — normalisation (T1)', () => {
  const enzyme = KNOWLEDGE_CARDS.find((c) => c.id === 'enzyme_activity');

  it('le doublon rédactionnel « بنيته (تفكيك) » est parti', () => {
    expect(enzyme).toBeTruthy();
    expect(enzyme!.shortAnswer).not.toContain('بنيته (تفكيك)');
  });

  it('le modèle de référence reste المفتاح والقفل (ancré au corpus leçons)', () => {
    expect(enzyme!.shortAnswer).toContain('المفتاح والقفل');
    expect(enzyme!.keywords).toContain('مفتاح وقفل');
  });

  it('le modèle induit est mentionné en note sous le nom du corpus (التوافق المحرض)', () => {
    expect(enzyme!.shortAnswer).toContain('التوافق المحرض');
    expect(enzyme!.keywords).toContain('التوافق المحرض');
    expect(enzyme!.shortAnswer).not.toContain('التوافق المستحث');
  });
});

// Un chiffre ATP unique : « نحو 38 » pour la physiologie complète (ancrage :
// 18 occurrences de « 38 » dans le corpus leçons), « حوالي 34 » conservé mais
// cadré « معظم الـ 38 » (les 2 ATP de glycolyse + 2 de la boucle sont hors
// السلسلة التنفسية). Ban supprimée : « 36-38 » (4 occurrences avant correction).
describe('chiffres ATP — un inter-banques (T1)', () => {
  const respiration = KNOWLEDGE_CARDS.find((c) => c.id === 'cellular_respiration');

  it('la fiche respiration cadre « معظم ATP » sur les ~38', () => {
    expect(respiration).toBeTruthy();
    const texts = [
      respiration!.shortAnswer,
      ...(respiration!.microAnswers ?? []).map((m) => m.answer),
    ].join(' ');
    expect(texts).toContain('من أصل نحو 38');
    expect(texts).toContain('نحو 38 ATP');
    expect(texts).not.toContain('36-38');
  });

  it('aucune chaîne « 36-38 » ne subsiste dans smartBotData ni dans le QCM', () => {
    const data = readFileSync('src/data/smartBotData.ts', 'utf8');
    expect(data).not.toContain('36-38');
    expect(data).toContain('نحو 38 ATP من الغلوكوز الكامل'); // mistake_energy_balance
    expect(data).toContain('نحو 38 ATP من جزيء غلوكوز'); // option QCM ene_q13
  });
});

// book_4 : « الخاصية الحمقلية » N'EST PAS orpheline — elle est portée par les
// sources officielles de l'app (okacha l.197-201 « الخاصية الحمقلية
// (الأمفوتيرية) », hosila l.83 « المركبات الأمفوتيرية (الحمقلية) », opuscule
// chunk_376). Le constat d'audit inversé est donc corrigé : on VERROUILLE le
// double ancrage الحمقلية/الأمفوتيرية tel quel.
describe('book_4 — الخاصية الحمقلية (الأمفوتيرية) reste doublement ancrée (T1)', () => {
  const book4 = BOOK_TUTOR_QA.find((q) => q.id === 'book_4');

  it('finalement les deux termes du corpus okacha/hosila', () => {
    expect(book4).toBeTruthy();
    expect(book4!.answer).toContain('الحمقلية');
    expect(book4!.answer).toContain('أمفوتيرية');
    expect(book4!.keywords).toContain('حمقلية');
    expect(book4!.keywords).toContain('أمفوتيرية');
  });
});

// book_18 (ex-book_19 avant renumérotation T3 ; 70 ميلي فولت) : valeur NON
// ancrée au corpus local (فولت = 0 dans lesson-index ET knowledge.json) —
// contenu laissé EXACTEMENT tel quel sur décision GO (2026-11-07), statut
// consigné dans docs/agents/SOURCES.md.
// Verrou : si quelqu'un touche cette valeur, il doit le faire sciemment.
describe('book_18 — valeur 70 mV gelée en l\'état (décision GO 2026-11-07)', () => {
  const book18 = BOOK_TUTOR_QA.find((q) => q.id === 'book_18');

  it('la mention « 70 ميلي فولت » reste identique', () => {
    expect(book18).toBeTruthy();
    expect(book18!.answer).toContain('70');
    expect(book18!.answer).toContain('ميلي فولت');
  });
});
