// correcteurV1.test.ts
// Jeu de validation du correcteur V1 — Sciences de la Nature et de la Vie (3AS).
//
// Deux responsabilités :
//   1. GARDE-FOU DE TRACABILITÉ : chaque mot-clé de la banque doit apparaître dans
//      au moins une des 4 sources officielles (L1..L4). Aucun terme « inventé à la
//      main » ne doit survivre. Les indices Unicode (CO₂, O₂) sont ramenés à leur
//      chiffre avant normalisation — sinon normalizeAr les détruit en espace.
//   2. JEU DE QUESTIONS NEUVES HORS GOLDEN SET : une question par unité (5 en
//      domaine 1 protéines, 3 en domaine 2 énergie, 3 en domaine 3 tectonique),
//      soit 11 au total. Chaque question vérifie
//      qu'une réponse modèle complète PASSE et qu'une réponse fausse / vide /
//      charabia ÉCHOUE. Réponses modèles rédigées naturellement (phrases), jamais
//      comme une simple liste de mots-clés (anti sur-ajustement).

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { normalizeAr } from './lib/validation/normalizeAr';
import {
  CORRECTEUR_V1_UNITES,
  SOURCES_LABELS,
  SEUIL_KEYWORDS,
  evaluerReponseKeywords,
} from './correcteurV1';

// ──────────────────────────────────────────────────────────────────────────────
// Sources officielles (lecture disque, UTF-8)
// ──────────────────────────────────────────────────────────────────────────────

const SRC_DIR = path.resolve(import.meta.dirname, '..', 'docs', 'sources');

function readSource(label: string): string {
  const filename = SOURCES_LABELS[label];
  return readFileSync(path.join(SRC_DIR, filename), 'utf-8');
}

/** Ramène les indices Unicode (CO₂, O₂…) à leur chiffre ASCII avant normalizeAr. */
function fixSubscripts(s: string): string {
  return s.replace(/[\u2080-\u2089]/g, (c) =>
    String(c.codePointAt(0)! - 0x2080),
  );
}

/** Normalisation commune pour la recherche de sous-chaîne (identique moteur). */
function normForTrace(s: string): string {
  return normalizeAr(fixSubscripts(s));
}

const SOURCES_NORM = (['L1', 'L2', 'L3', 'L4'] as const).reduce<
  Record<string, string>
>((acc, l) => {
  acc[l] = normForTrace(readSource(l));
  return acc;
}, {});

// ──────────────────────────────────────────────────────────────────────────────
// 1. Intégrité de la banque
// ──────────────────────────────────────────────────────────────────────────────

describe('banque de mots-clés — intégrité', () => {
  it('contient exactement les 11 unités du programme (ids 1..11)', () => {
    expect(CORRECTEUR_V1_UNITES).toHaveLength(11);
    const ids = CORRECTEUR_V1_UNITES.map((u) => u.uniteId);
    expect([...ids].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('classe chaque unité dans son domaine officiel (1: protéines, 2: énergie, 3: tectonique)', () => {
    const expected: Record<number, 1 | 2 | 3> = {
      1: 1, 2: 1, 3: 1, 4: 1, 5: 1,
      6: 2, 7: 2, 8: 2,
      9: 3, 10: 3, 11: 3,
    };
    for (const u of CORRECTEUR_V1_UNITES) {
      expect(u.domaine, `unite ${u.uniteId}`).toBe(expected[u.uniteId]);
    }
  });

  it('donne à chaque unité un titre et des mots-clés non vides', () => {
    for (const u of CORRECTEUR_V1_UNITES) {
      expect(u.titre.trim().length, `unite ${u.uniteId}`).toBeGreaterThan(0);
      expect(u.motsCles.length, `unite ${u.uniteId}`).toBeGreaterThan(0);
      for (const kw of u.motsCles) {
        expect(kw.trim().length, `unite ${u.uniteId} - keyword`).toBeGreaterThan(0);
      }
    }
  });

  it('ne contient aucun doublon normalisé au sein d une unité', () => {
    for (const u of CORRECTEUR_V1_UNITES) {
      const seen = new Set<string>();
      for (const kw of u.motsCles) {
        const nk = normalizeAr(kw);
        expect(seen.has(nk), `doublon ${kw} (unite ${u.uniteId})`).toBe(false);
        seen.add(nk);
      }
    }
  });

  it('référence chaque unité à des sources connues du contrat', () => {
    for (const u of CORRECTEUR_V1_UNITES) {
      expect(u.sources.length, `unite ${u.uniteId}`).toBeGreaterThan(0);
      for (const s of u.sources) {
        expect(SOURCES_LABELS[s], `unite ${u.uniteId} - source ${s}`).toBeDefined();
      }
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 2. Traçabilité : chaque mot-clé provient d'au moins une source officielle
// ──────────────────────────────────────────────────────────────────────────────

describe('traçabilité des mots-clés dans les sources officielles', () => {
  it('chaque mot-clé apparaît dans au moins une des sources DÉCLARÉES de son unité', () => {
    const untraceable: string[] = [];
    for (const u of CORRECTEUR_V1_UNITES) {
      for (const kw of u.motsCles) {
        const nk = normForTrace(kw);
        if (!nk) {
          untraceable.push(`unite ${u.uniteId} - ${kw} (normalise vide)`);
          continue;
        }
        const tracable = u.sources.some((label) => {
          const sourceText = SOURCES_NORM[label];
          if (!sourceText) return false;
          if (sourceText.includes(nk)) return true;
          // Tolérance « الـ » : la source peut écrire le mot sans article défini.
          const relaxed = nk.startsWith('ال') && nk.length > 4 ? nk.slice(2) : nk;
          return relaxed !== '' && sourceText.includes(relaxed);
        });
        if (!tracable) {
          untraceable.push(
            `unite ${u.uniteId} - ${kw} (sources déclarées: ${u.sources.join(',')})`,
          );
        }
      }
    }
    expect(untraceable, `mots-clés sans source: ${untraceable.join(' | ')}`).toEqual([]);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 3. Jeu de 10 questions neuves (hors Golden Set) couvrant les 3 domaines
// ──────────────────────────────────────────────────────────────────────────────

interface QuestionV1 {
  id: string;
  uniteId: number;
  /** Intitulé de la question (nouveau, pas dans l application existante). */
  enonce: string;
  /** Mots-clés de l unité exigés pour une réponse complète. */
  attendus: string[];
  /** Réponse modèle, rédigée naturellement. */
  reponseModele: string;
  /** Réponse plausible mais fausse (doit échouer). */
  reponseFausse: string;
}

const QUESTIONS_V1: QuestionV1[] = [
  // ── Domaine 1 : التخصص الوظيفي للبروتينات ──────────────────────────────────
  {
    id: 'v1-prot-synthese',
    uniteId: 1,
    enonce: 'صف المراحل الأساسية لتركيب البروتين داخل الخلية حقيقية النواة.',
    attendus: ['استنساخ', 'الترجمة', 'الرامزة المضادة', 'متعدد الريبوزوم', 'الشفرة الوراثية'],
    reponseModele:
      'يتم تركيب البروتين على مرحلتين: الاستنساخ في النواة ثم الترجمة في الهيولى على الريبوزوم، ' +
      'حيث تتعرّف الرامزة المضادة على الرامزة حسب الشفرة الوراثية، ويمكن أن تُقرأ نفس الرامزة ' +
      'من طرف متعدد الريبوزوم في الوقت نفسه.',
    reponseFausse:
      'البروتينات تتشكل مباشرة من الدهون دون أي مراحل وسيطة ولا دور للحمض النووي.',
  },
  {
    id: 'v1-prot-structure-fonction',
    uniteId: 2,
    enonce: 'كيف تفسر حدوث فقر الدم المنجلي انطلاقا من بنية البروتين؟',
    attendus: ['فقر الدم المنجلي', 'البنية الأولية', 'البنية الثالثية', 'الموقع 6', 'الهيموغلوبين'],
    reponseModele:
      'فقر الدم المنجلي سببه تغيير حمض أميني في الموقع 6 من السلسلة الببتيدية للهيموغلوبين، ' +
      'أي تغير في البنية الأولية يؤدي إلى تغير البنية الثالثية فيظهر الشكل المنجلي.',
    reponseFausse:
      'هذا المرض ينتقل بالملامسة ولا علاقة له ببنية البروتين إطلاقا.',
  },
  {
    id: 'v1-prot-enzymes',
    uniteId: 3,
    enonce: 'كيف يوضح التكامل الحفزي خصوصية الإنزيم تجاه ركيزته، وما دور الشروط المثلى؟',
    attendus: ['التكامل الحفزي', 'الموقع الفعال', 'الحرارة المثلى', 'تشبع', 'نوعية'],
    reponseModele:
      'يرتبط الإنزيم بركيزته في الموقع الفعال بتوافق تام يسمى التكامل الحفزي، وهذا يفسر ' +
      'نوعية الإنزيم تجاه ركيزة محددة؛ لكن نشاطه يبلغ أقصاه عند الحرارة المثلى، وقد يحدث ' +
      'تشبع عند ارتفاع تركيز الركيزة.',
    reponseFausse:
      'الإنزيم يعمل على كل المواد دون تمييز وبأي درجة حرارة مهما كانت.',
  },
  {
    id: 'v1-prot-immunite',
    uniteId: 4,
    enonce: 'كيف ينتج الجسم أجساما مضادة عند دخول مستضد؟',
    attendus: ['المستضد', 'أجسام مضادة', 'خلايا بلازمية', 'الاستجابة الأولية', 'خلايا ذاكرة'],
    reponseModele:
      'عند دخول المستضد تبدأ الاستجابة الأولية حيث تنشط الخلايا الليمفاوية LB وتتحول إلى ' +
      'خلايا بلازمية تفرز أجسام مضادة خاصة بالمستضد، وتتكون خلايا ذاكرة تضمن استجابة ثانوية أسرع وأقوى.',
    reponseFausse:
      'الأجسام المضادة تولد مع الإنسان ولا تحتاج إلى أي مستضد ولا توجد خلايا ذاكرة.',
  },
  {
    id: 'v1-prot-nerveux',
    uniteId: 5,
    enonce: 'صف آلية نقل النبأ العصبي عند المشبك الكيميائي مع توضيح دور كل مكوّن.',
    attendus: ['الناقل العصبي', 'حويصلات مشبكية', 'أستيل كولين', 'مستقبلات', 'زوال الاستقطاب'],
    reponseModele:
      'ينقل النبأ العصبي عند المشبك الكيميائي بواسطة الناقل العصبي أستيل كولين الذي تفرغه ' +
      'الحويصلات المشبكية في الشق المشبكي، ثم يرتبط بمستقبلات غشاء الخلية بعد المشبكية مسببا ' +
      'زوال الاستقطاب عند تجاوز العتبة.',
    reponseFausse:
      'النبأ العصبي ينتقل مباشرة عبر السائل بين العصبونات دون أي مواد كيميائية.',
  },

  // ── Domaine 2 : التحوّلات الطاقوية ─────────────────────────────────────────
  {
    id: 'v1-ener-photosynthese',
    uniteId: 6,
    enonce: 'أين تتم التفاعلات الكيميائية للتركيب الضوئي وما هي أهم مراحلها؟',
    attendus: ['حلقة كالفن', 'الستروما', 'RuBisCO', 'APG', 'المرحلة الكيموحيوية'],
    reponseModele:
      'تتم المرحلة الكيموحيوية للتركيب الضوئي في الستروما، وتسمى حلقة كالفن، حيث يعمل ' +
      'RuBisCO على تثبيت الكربون مكونا مركبا APG.',
    reponseFausse:
      'التركيب الضوئي يتم في الأوراق فقط دون أي تفاعلات كيميائية مسماة.',
  },
  {
    id: 'v1-ener-respiration',
    uniteId: 7,
    enonce: 'قارن بين مصير الغلوكوز في التنفس والتخمر من حيث المردود الطاقوي.',
    attendus: ['التحلل السكري', 'حمض البيروفيك', 'حلقة كريبس', 'الفسفرة التأكسدية', 'ATP'],
    reponseModele:
      'يبدأ التنفس بالتحلل السكري الذي يحول الغلوكوز إلى حمض البيروفيك، ثم يتحول إلى أستيل ' +
      'مرافق الإنزيم الذي يدخل حلقة كريبس، وتنتج ATP بوفرة في مرحلة الفسفرة التأكسدية.',
    reponseFausse:
      'التنفس يحدث في الرئتين فقط ولا ينتج أي طاقة قابلة للاستعمال.',
  },
  {
    id: 'v1-ener-bilan',
    uniteId: 8,
    enonce: 'ماذا تستنتج من الحصيلة الطاقوية حول تحويل الطاقة في الكائنات الحية؟',
    attendus: ['الحصيلة الطاقوية', 'التركيب الضوئي', 'التنفس', '38 ATP', 'المادة تدور'],
    reponseModele:
      'تبين الحصيلة الطاقوية أن التركيب الضوئي يخزن الطاقة في المواد العضوية بينما يحررها التنفس، ' +
      'والمردود الكامل للتنفس هو 38 ATP، فالطاقة تتدفق والمادة تدور بين الكائنات.',
    reponseFausse:
      'الطاقة تختفي عند كل تحول ولا يمكن أن تنتقل بين الكائنات الحية.',
  },

  // ── Domaine 3 : التكتونية العامة ───────────────────────────────────────────
  {
    id: 'v1-tecto-plaques',
    uniteId: 9,
    enonce: 'ما هي الأدلة التي تثبت توسع قاع المحيط عند الظهرات وسط محيطية؟',
    attendus: ['الظهرة وسط محيطية', 'المغنطة المتناظرة', 'توسع قاع المحيط', 'القشرة المحيطية', 'الغوص'],
    reponseModele:
      'تؤكد المغنطة المتناظرة على جانبي الظهرة وسط محيطية توسع قاع المحيط، حيث تتكون ' +
      'القشرة المحيطية الجديدة باستمرار ثم تخضع لظاهرة الغوص عند الخنادق.',
    reponseFausse:
      'قاع المحيط ثابت لا يتغير والصفائح لا تتحرك أبدا عبر الزمن الجيولوجي.',
  },
  {
    id: 'v1-tecto-structure',
    uniteId: 10,
    enonce: 'كيف تمكن العلماء من معرفة بنية باطن الأرض دون الحفر فيه؟',
    attendus: ['الموجات الزلزالية', 'الموجة P', 'موجات S', 'انقطاع موهو', 'النواة'],
    reponseModele:
      'بفضل دراسة الموجات الزلزالية تبين أن الموجة P تخترق الأرض بينما تختفي موجات S في اللب ' +
      'الخارجي، وكشف انقطاع موهو الحد بين القشرة والغلاف، كما حدد العلماء النواة بفضل موجات S.',
    reponseFausse:
      'لا يمكن معرفة باطن الأرض إلا بالحفر المباشر في أعماق كبيرة.',
  },
  {
    id: 'v1-tecto-geo-structures',
    uniteId: 11,
    enonce: 'كيف تتشكل البنيات الجيولوجية الجبلية عند تصادم صفيحتين قاريتين؟',
    attendus: ['دورة ويلسون', 'تصادم', 'الطيات', 'الأوفيوليت', 'الهيمالايا'],
    reponseModele:
      'حسب دورة ويلسون، عند تصادم صفيحتين قاريتين تتحول المنطقة إلى سلسلة جبلية بالطيات ' +
      'والفوالق، وترتفع الأوفيوليت إلى السطح، ومثال ذلك سلسلة الهيمالايا.',
    reponseFausse:
      'السلاسل الجبلية تتشكل فقط بفعل الرياح والمياه عبر الزمن الطويل.',
  },
];

describe('jeu de questions neuves (hors Golden Set) — les 3 domaines, les 11 unités', () => {
  it('contient 11 questions : chaque unité du programme a sa question (5 + 3 + 3)', () => {
    expect(QUESTIONS_V1).toHaveLength(11);
    const couvertes = new Set(QUESTIONS_V1.map((q) => q.uniteId));
    const manquantes = CORRECTEUR_V1_UNITES.filter((u) => !couvertes.has(u.uniteId)).map(
      (u) => u.uniteId,
    );
    expect(manquantes, `unités sans aucune question: ${manquantes.join(', ')}`).toEqual([]);
    const parDomaine = CORRECTEUR_V1_UNITES.reduce<Record<number, number>>(
      (acc, u) => {
        acc[u.domaine] = (acc[u.domaine] ?? 0) + QUESTIONS_V1.filter((q) => q.uniteId === u.uniteId).length;
        return acc;
      },
      {},
    );
    expect(parDomaine[1]).toBe(5);
    expect(parDomaine[2]).toBe(3);
    expect(parDomaine[3]).toBe(3);
  });

  it('référence chaque attendu à un vrai mot-clé de la banque (anti typo)', () => {
    for (const q of QUESTIONS_V1) {
      const unite = CORRECTEUR_V1_UNITES.find((u) => u.uniteId === q.uniteId);
      expect(unite, `question ${q.id} → unité ${q.uniteId} inconnue`).toBeDefined();
      expect(q.attendus.length, `question ${q.id}`).toBeGreaterThan(0);
      for (const a of q.attendus) {
        expect(unite!.motsCles, `question ${q.id} - attendu ${a}`).toContain(a);
      }
    }
  });

  it.each(QUESTIONS_V1)('la réponse modèle %s couvre ≥ 60% des attendus', (q) => {
    const res = evaluerReponseKeywords(q.reponseModele, q.uniteId, q.attendus);
    expect(res.trouve, `trouves=${res.trouves.join(', ')}`).toBeGreaterThanOrEqual(3);
    expect(res.couverture, `manquants=${res.manquants.join(', ')}`).toBeGreaterThanOrEqual(SEUIL_KEYWORDS);
    expect(res.passe, `manquants=${res.manquants.join(', ')}`).toBe(true);
  });

  it.each(QUESTIONS_V1)('la réponse fausse %s échoue (couverture < seuil)', (q) => {
    const res = evaluerReponseKeywords(q.reponseFausse, q.uniteId, q.attendus);
    expect(res.passe, `trouves=${res.trouves.join(', ')}`).toBe(false);
  });

  it.each(QUESTIONS_V1)('la réponse vide échoue pour %s', (q) => {
    const res = evaluerReponseKeywords('', q.uniteId, q.attendus);
    expect(res.passe).toBe(false);
  });

  it.each(QUESTIONS_V1)('le charabia échoue pour %s', (q) => {
    const res = evaluerReponseKeywords('xcvb qsdq 12345 !!', q.uniteId, q.attendus);
    expect(res.passe).toBe(false);
  });

  it.each(QUESTIONS_V1)('la réponse modèle %s n est pas la simple liste des attendus (anti sur-ajustement)', (q) => {
    // Une réponse « triche » = exactement les mots-clés collés les uns aux autres.
    const triche = q.attendus.join(' ');
    expect(normalizeAr(q.reponseModele)).not.toBe(normalizeAr(triche));
  });

  it.each(QUESTIONS_V1)('l énoncé %s est bien HORS Golden Set (absent des données de l app)', (q) => {
    // Anti régénération : chaque nouvelle question doit être neuve, jamais calquée
    // sur une question déjà présente dans les surfaces de l application.
    const surfaces = [
      '../data/kunzDatabase.ts',
      '../quizCorpus.ts',
      '../data/activeLessons.ts',
      '../tutorKnowledge.ts',
      '../data/documentAnalysisExercises.ts',
    ];
    const needles = [
      q.enonce.slice(0, 24),
      q.enonce.slice(0, 40),
      q.reponseModele.slice(0, 40),
    ];
    const found: string[] = [];
    for (const rel of surfaces) {
      const abs = new URL(rel, import.meta.url);
      if (abs.pathname.includes('/correcteurV1')) continue;
      let txt: string;
      try {
        txt = readFileSync(abs, 'utf-8');
      } catch {
        continue;
      }
      const normTxt = normalizeAr(txt);
      for (const n of needles) {
        const nn = normalizeAr(n);
        if (nn && normTxt.includes(nn)) {
          found.push(`${rel} ← «${n}»`);
          break;
        }
      }
    }
    expect(found, `question non neuve, chevauchement: ${found.join(' | ')}`).toEqual([]);
  });
});
