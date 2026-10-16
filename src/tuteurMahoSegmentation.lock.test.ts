/**
 * VERROU — Audit « Opus 5 High » (16/10/2026) + reproduction locale (sonde 32 cas).
 *
 * DÉFAUT REPRODUIT : le préfixe interrogatif collé « ماهو » (orthographe clavier
 * ultra-courante) créait un token 4 lettres qui, via la tolérance aux fautes
 * (Levenshtein(ماهو → موهو) = 1, alias « Moho » de la carte géologie), faisait
 * gagner « بنية الكرة الأرضية » +60 alias-overlap = 1,00 → 9 notions sur 16
 * recevaient un cours de GÉOLOGIE à 70 % de confiance, y compris quand
 * l'orthographe propre « ما هو » donnait la bonne carte une seconde plus tôt.
 *
 * GARANTIE VERROUILLÉE : quelle que soit l'orthographe du préfixe (collée ou
 * espacée), le tuteur donne LA MÊME réponse pour la même notion. Le mot
 * interrogatif ne peut plus choisir une carte à la place de l'élève.
 *
 * GARDE-FOU B3 PRÉSERVÉ (morchidCorrectifs.test.ts l. 99) : « ماهو اللب » doit
 * TOUJOURS servir « بنية الكرة الأرضية » — car « اللب » EST un mot de la fiche
 * du noyau terrestre ; et l'alias « موهو » (discontinuité de Moho) reste servi
 * aux vraies questions tectoniques.
 */
import { describe, expect, it } from 'vitest';
import { answerTutorQuestion, findBestKnowledgeCard } from './smartTutorEngine';

/** 16 notions majeures du programme — la sonde de l'audit, exactement. */
const NOTIONS = [
  'كمون العمل',
  'التخمر اللبني',
  'المناعة',
  'التمثيل الضوئي',
  'الترجمة',
  'السلسلة التنفسية',
  'التنفس الخلوي',
  'الأحماض النووية',
  'التحلل السكري',
  'اقتران التنفس والبناء الضوئي',
  'التخصص الوظيفي للبروتينات',
  'الصدفية التكتونية',
  'الحرق الخلوي',
  'الكروموسوم',
  'الإنزيمات',
  'الرباط العصبي',
];

describe('Verrou sonde audit Opus 5 — préfixe interrogatif « ماهو » collé', () => {
  it.each(NOTIONS)('« ماهو %s » donne la même réponse que « ما هو %s »', (notion) => {
    const espacee = answerTutorQuestion(`ما هو ${notion}`);
    const colle = answerTutorQuestion(`ماهو ${notion}`);
    expect(colle.text).toBe(espacee.text);
  });

  it('les EXEMPLES de l\'audit ne servent plus le cours de géologie', () => {
    for (const q of ['ماهو كمون العمل', 'ماهو التخمر اللبني']) {
      const r = answerTutorQuestion(q);
      if (r.text.includes('بنية الكرة الأرضية')) {
        // Autorisé UNIQUEMENT si la question est elle-même géologique (ex: اللب) —
        // ces deux notions relèvent de la neurophysiologie et de la métabolique.
        expect.fail(`Réponse détournée vers la géologie : ${q}`);
      }
    }
  });

  it('« كمون العمل » est COUVERT et ne tombe plus dans l\'échec déclaré', () => {
    // Audit Opus 5 — cas de repro ① (« ماهو كمون العمل »). Après segmentation,
    // la question doit RÉUSSIR, pas seulement éviter la géologie : le livre
    // scanné (data/bookContent.index.json, chapitre 27, unité 5, l. 142) titre
    // une section « كمون العمل » dans le chapitre « النقل المشبكي » — l'alias
    // est donc du verbatim de la source, ajouté à la carte الاتصال العصبي.
    for (const q of ['ما هو كمون العمل', 'ماهو كمون العمل']) {
      const r = answerTutorQuestion(q);
      expect(r.text).not.toContain('لم أجد');
      expect(r.text).not.toContain('بنية الكرة');
      expect(r.text).not.toContain('hors');
    }
  });

  it('garde-fou B3 intact : « ماهو اللب » sert toujours la fiche du noyau terrestre', () => {
    const r = answerTutorQuestion('ماهو اللب');
    expect(r.text).toContain('بنية الكرة');
  });

  it('la carte de géographie physique reste atteignable par son vrai mot « موهو »', () => {
    expect(findBestKnowledgeCard('ما هي المواجهة بين الصفيحتين تحت موهو؟', null)?.title ?? '').toContain(
      'بنية الكرة',
    );
  });
});
