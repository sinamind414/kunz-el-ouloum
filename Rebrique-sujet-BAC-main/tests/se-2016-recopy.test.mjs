/* ============================================================
   SE 2016 — verrou de recopie (Phase 3 du plan SE 2013-2020)
   ------------------------------------------------------------
   Les consignes de `data/years/se/year-2016.js` ont été recopiées mot à
   mot sur l'IMAGE des dix pages du livret (passes 1 et 2 du 2026-09-23
   → docs/RELECTURE_SE_2016_CHECKLIST.md, recopie revérifiée sur l'image
   le 2026-09-24). Ce fichier fige ce qui a été lu.

   Deux choses sont protégées ici, et la seconde compte autant que la
   première :
     1. le texte imprimé, diacritiques compris, et sa page de livret ;
     2. la RÉÉCRITURE des six exercices : l'année était encodée sur des
        thèmes pédagogiques qui ne correspondaient pas aux pages (S1-E1
        portait « الاستنساخ داخل النواة » là où la page imprime la
        مورثة وتعبيرها بمبرمج Anagène ; S2-E3 portait « بنية الكرة
        الأرضية » là où la page imprime المشبك المثبط والمنعكس العضلي).

   Il ne certifie AUCUN barème : `scoringReviewStatus` reste provisional.
   Barème imprimé : 06 / 07 / 07 sur les deux sujets (S1-E3 et S2-E3
   portaient 8 points dans l'ancien encodage).
   ============================================================ */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { YEAR_2016_SE } from "../data/years/se/year-2016.js";
import { officialTaskInventoryFor } from "../data/official-tasks.js";

const sujet = (id) => YEAR_2016_SE.sujets.find((s) => s.id === id);
const ex = (sujetId, exNumber) => sujet(sujetId).exercises.find((e) => e.number === exNumber);
const pole = (sujetId, exNumber, letter) => ex(sujetId, exNumber).poles[letter];

/* Texte imprimé, tel que relu sur l'image (passe 2 puis revérification).
   `[sujet, exercice, pôle, page du livret, texte]`. */
const CONSIGNES = [
  [
    1,
    1,
    "S",
    1,
    "1- قَدِّمْ عنوانا مناسبا لكل من الشكلين (أ) و(ب) للوثيقة (1). 2- أ- اكتب أسماء البيانات المرقمة في الشكلين (أ) و(ب) للوثيقة (1). ب- وَضِّحْ العلاقة الوظيفية بين الشكلين (أ) و(ب) للوثيقة (1)."
  ],
  [
    1,
    1,
    "E",
    2,
    "1- انطلاقا من نتائج الوثيقة (2): أ- بيّن الجوانب التي عالجتها دراسة هذه المورثات باستعمال مبرمج Anagène. علل إجابتك. ب- حدّد وحدة الشفرة الوراثية مع التعليل. ج- استخرج خصائص الشفرة الوراثية. د- مَثِّلْ قطعة المورثة (1) الموافقة للجزء (a) محددا السلسلة الناسخة. 2- تتميز السلاسل (ع) الموافقة للمورثات الأربعة بتخصص وظيفي. أ- احسب عدد الوحدات البنائية للسلسلة (ع) الوظيفية للمورثات الأربعة. ب- برّر إذن سبب تخصصها الوظيفي."
  ],
  [
    1,
    1,
    "W",
    2,
    "III- مما سبق ومن معارفك أنجز رسما تخطيطيا تفصيليا تُبرز فيه مراحل العلاقة بين المورثة ونتائج تعبيرها المورثي."
  ],
  [
    1,
    2,
    "S",
    3,
    "1- تَعَرَّفْ على الخلية اللمفاوية (س) والعناصر (ح). 2- أ- أنجز رسما تخطيطيا على المستوى الجزيئي للجزء المؤطر في الشكل (أ) للوثيقة (1). 2- ب- اشرح نشاط الخلية اللمفاوية (س) الذي نتج عنه مظهر الغشاء الهيولي الممثل في الشكل (ب)."
  ],
  [
    1,
    2,
    "E",
    3,
    "1- بيّن مصدر الخلية (س) باستغلال نتائج جدول الوثيقة (2). 2- أ- حلّل الشكل (أ) من الوثيقة (2). ب- فسّر النتائج المحصل عليها في الشكل (ب) للوثيقة (2). ج- ما هي المعلومات المستخلصة من الشكلين (أ) و(ب) للوثيقة (2)؟"
  ],
  [
    1,
    2,
    "W",
    3,
    "III- ممّا سبق ومن معلوماتك بيّن في نص علمي مراحل الاستجابة المناعية التي تتوسطها الخلايا اللمفاوية (س)."
  ],
  [
    1,
    3,
    "S",
    4,
    "1- أ- تَعَرَّفْ على المركبات الكيميائية الممثلة بالأحرف (س، ص، ع، ل، م) في الشكل (أ) للوثيقة (2). ب- حَدِّدْ بدقة على المستوى الجزيئي مقر حدوث كل من التفاعلين (1) و(2). ج- عَيِّنْ التفاعل الذي يتطلب حدوثه طاقة من مصدر خارجي. علّل إجابتك مبيّنا مصدر هذه الطاقة."
  ],
  [
    1,
    3,
    "E",
    4,
    "1- حدّد نوع الخلية التي يتواجد بها الشكلان (أ) و(ب) معا. 2- أ- ترجم كل من شكلي الوثيقة (1) إلى رسم تخطيطي عليه البيانات اللازمة. ب- سمّ الآلية التي تسمح بتركيب ATP في كل من شكلي الوثيقة (1). ثم أ- حلّل نتائج الشكل (ب) للوثيقة (2). ماذا تستنتج؟ ب- علّل ثبات كمية الـ ATP المتشكلة في المرحلة (3). ج- حدّد بدقة مصير الـ ATP المتشكل على مستوى الصانعة الخضراء. د- ما هي النتائج التي يمكن الحصول عليها إذا أعدنا التجربة السابقة على حويصلات مُغلقة للغشاء الداخلي للميتوكوندري في نفس الشروط التجريبية السابقة؟ 3- أوجد العلاقة بين التفاعلين (1) و(2) وتركيب الـ ATP."
  ],
  [
    1,
    3,
    "W",
    5,
    "III- مما سبق ومن معلوماتك قارن في جدول بين آلية تركيب الـ ATP على مستوى الغشاء الداخلي للميتوكوندري وعلى مستوى تيلاكوئيد الصانعة الخضراء."
  ],
  [
    2,
    1,
    "S",
    6,
    "1- ماذا يمثل الجزء المؤطر (س)؟ علّل إجابتك. 2- أ- تَعَرَّفْ على المستوى البنائي لجزيئة الأميلاز مع التعليل. ب- اذكر الروابط الكيميائية المساهمة في ثبات هذه البنية."
  ],
  [
    2,
    1,
    "E",
    6,
    "أ- فسّر النتائج التجريبية. ب- ماذا تستخلص بخصوص الجزء المؤطر (س)؟ 2- أ- حلّل منحنيي الشكل (ب) من الوثيقة (2). ماذا تستنتج؟ ب- فسّر معتمدا على الوثيقة (2) كيف يعمل هذا الدواء على تخفيض نسبة السكر في دم المصاب."
  ],
  [2, 1, "W", 7, "III- انطلاقا مما سبق بيّن كيف يكتسب الأنزيم تخصصه الوظيفي."],
  [
    2,
    2,
    "S",
    7,
    "1- أ- تَعَرَّفْ على هذه العضية. ب- اكتب بيانات العناصر المرقمة. 2- أ- حَدِّدْ نمط التحول الطاقوي الذي يحدث على مستوى هذه العضية. ب- ما هي الظاهرة البيولوجية المعنية؟ اكتب معادلاتها الإجمالية."
  ],
  [
    2,
    2,
    "E",
    8,
    "أ- علّل سبب إجراء التجربة في الظلام. ب- ما هي المعلومات المستخلصة من هذه النتائج التجريبية؟ 3- يتدخل الأنزيم (E) للشكل (ب) من الوثيقة (2) في المرحلة التي تلي المرحلة السابقة في الظاهرة المدروسة. أ- تعرّف على الأنزيم (E) ثم حدّد مادة تفاعله (الركيزة S) والناتج المتحرر (P). ب- حدّد المرحلة التي يتدخل فيها الأنزيم (E). ج- يتوقف استمرار عمل الأنزيم (E) على نشاط جزيئة الشكل (أ)، بيّن ذلك وحدد دور الأنزيم (E) في هذه الظاهرة."
  ],
  [
    2,
    2,
    "W",
    8,
    "III- من معلوماتك ومما سبق، وَضِّح برسم تخطيطي آلية تحويل الطاقة خلال الظاهرة البيولوجية المدروسة."
  ],
  [
    2,
    3,
    "S",
    9,
    "1- أ- حلّل النتائج الممثلة في الشكل (ب) للوثيقة (1). ب- ما نوع المشبك بين العصبون الجامع والعصبون الحركي؟"
  ],
  [
    2,
    3,
    "E",
    9,
    "2- اشرح أهمية تدخل هذا المشبك في تنسيق عمل العضلتين المتضادتين خلال المنعكس العضلي. 1- أ- حلّل النتائج الممثلة في الوثيقة (2). ب- فسّر نتائج المرحلة (1). 2- اقترح فرضية تفسيرية لتأثير مادة Benzodiazépine (BZD). 3- حُقنت المنطقة (ع) من الشكل (أ) للوثيقة (1) بتراكيز متزايدة من BZD بوجود كمية كافية من GABA وتم قياس النسبة المئوية (%) لتثبيت الـ GABA على القنوات الغشائية والنتائج ممثلة في الجدول التالي: أ- هل هذه النتائج تؤكد صحة الفرضية المقترحة؟ علّل. ب- اشرح إذن لماذا تستعمل مادة BZD في معالجة التشنج العضلي."
  ],
  [
    2,
    3,
    "W",
    10,
    "III- من معارفك ومما استخلصته من هذه الدراسة، بَيِّن برسم تخطيطي وظيفي على المستوى الجزيئي آلية عمل المشبك بين العصبون الجامع والعصبون الحركي."
  ]
];

test("SE 2016 : les 18 consignes officielles sont figées mot à mot avec leur page de livret", () => {
  for (const [sujetId, exNumber, letter, page, texte] of CONSIGNES) {
    const p = pole(sujetId, exNumber, letter);
    assert.equal(p.bacPromptSource, "official", `S${sujetId}/E${exNumber}/${letter} doit être official`);
    assert.equal(p.bacPrompt, texte, `texte de S${sujetId}/E${exNumber}/${letter}`);
    assert.equal(p.bacPromptPage, page, `page de S${sujetId}/E${exNumber}/${letter}`);
    assert.equal(
      p.bacPromptVerifiedAt,
      "2026-09-24",
      `date de relecture de S${sujetId}/E${exNumber}/${letter}`
    );
    assert.ok(
      /RELECTURE_SE_2016_CHECKLIST/.test(p.bacPromptNotes || ""),
      `note de provenance absente pour S${sujetId}/E${exNumber}/${letter}`
    );
  }
});

test("SE 2016 : 18 consignes officielles et 6 cadrages reconstruits, pas un de plus", () => {
  let official = 0;
  let reconstructed = 0;
  for (const s of YEAR_2016_SE.sujets) {
    for (const e of s.exercises) {
      for (const p of Object.values(e.poles)) {
        if (p.bacPromptSource === "official") official += 1;
        if (p.bacPromptSource === "reconstructed") reconstructed += 1;
      }
    }
  }
  assert.equal(official, CONSIGNES.length, "toute promotion doit passer par la checklist");
  assert.equal(official + reconstructed, 24, "4 pôles × 3 exercices × 2 sujets");
});

test("SE 2016 : les six exercices portent le thème imprimé sur la page, pas l'ancien thème pédagogique", () => {
  /* Régression du défaut majeur de cette année : les six exercices étaient
     encodés sur d'autres sujets que ceux imprimés. Les libellés ci-dessous
     sont ceux de la checklist ; l'ancien encodage est cité en commentaire. */
  const THEMES = [
    [1, 1, "المورثة وتعبيرها المورثي (Anagène)"], // était : الاستنساخ داخل النواة
    [1, 2, "الخلية اللمفاوية (س) والاستجابة الخلوية"], // était : التخصص الوظيفي للإنزيم
    [1, 3, "إنتاج الـ ATP: تيلاكوئيد الصانعة الخضراء والغشاء الداخلي للميتوكوندري"], // était : المناعة الخلطية
    [2, 1, "الأميلاز و α غلوكوزيداز: بنية–وظيفة والـ Glucobay"], // était : المشبك الكيميائي
    [2, 2, "العضية وتدرج البروتونات والأنزيم (E)"], // était : التخمر والتنفس
    [2, 3, "المشبك المثبط (GABA) والمنعكس العضلي والـ BZD"] // était : بنية الكرة الأرضية
  ];
  for (const [sujetId, exNumber, label] of THEMES) {
    assert.equal(ex(sujetId, exNumber).label, label, `label S${sujetId}/E${exNumber}`);
    assert.ok((ex(sujetId, exNumber).desc || "").length > 20, `S${sujetId}/E${exNumber} : desc absente`);
  }
  const interdits = ["الاستنساخ داخل النواة", "بنية الكرة الأرضية", "المناعة الخلطية", "التخمر والتنفس"];
  for (const s of YEAR_2016_SE.sujets) {
    for (const e of s.exercises) {
      for (const mot of interdits) {
        assert.ok(
          !(e.label || "").includes(mot) && !(e.desc || "").includes(mot),
          `S${s.id}/E${e.number} garde l'ancien thème « ${mot} »`
        );
      }
    }
  }
});

test("SE 2016 : les barèmes imprimés 6 / 7 / 7 sont ceux des deux sujets", () => {
  for (const s of YEAR_2016_SE.sujets) {
    assert.deepEqual(
      s.exercises.map((e) => e.max),
      [6, 7, 7],
      `barème lu sur l'image (titres d'exercices), sujet ${s.id}`
    );
    for (const e of s.exercises) {
      const sum = Object.values(e.poles).reduce((total, p) => total + p.points, 0);
      assert.ok(Math.abs(sum - e.max) < 1e-6, `somme ${sum} ≠ max ${e.max} pour S${s.id}/E${e.number}`);
    }
  }
});

test("SE 2016 : les six cadrages reconstruits portent une note datée et aucune page", () => {
  let recon = 0;
  for (const s of YEAR_2016_SE.sujets) {
    for (const e of s.exercises) {
      for (const [letter, p] of Object.entries(e.poles)) {
        if (p.bacPromptSource !== "reconstructed") continue;
        recon += 1;
        assert.equal(p.bacPromptPage, undefined, `S${s.id}/E${e.number}/${letter} ne doit pas avoir de page`);
        assert.match(p.bacPromptNotes, /2026-09-24/, `S${s.id}/E${e.number}/${letter} : note non datée`);
        assert.match(
          p.bacPromptNotes,
          /aucune question imprimée autonome/,
          `S${s.id}/E${e.number}/${letter} : la note doit dire pourquoi le pôle n'est pas officiel`
        );
      }
    }
  }
  assert.equal(recon, 6, "un seul cadrage par exercice, les six pôles N");
});

test("SE 2016 : les regroupements de phrases imprimées sont écrits dans la note", () => {
  for (const [sujetId, exNumber, letter] of [
    [1, 1, "S"],
    [1, 1, "E"],
    [1, 2, "S"],
    [1, 2, "E"],
    [1, 3, "S"],
    [1, 3, "E"],
    [2, 1, "S"],
    [2, 1, "E"],
    [2, 2, "S"],
    [2, 2, "E"],
    [2, 3, "S"],
    [2, 3, "E"]
  ]) {
    assert.match(
      pole(sujetId, exNumber, letter).bacPromptNotes,
      /Regroupement/,
      `S${sujetId}/E${exNumber}/${letter} : regroupement non noté`
    );
  }
});

test("SE 2016 : le générateur rattache les 18 consignes au bon fichier (livret 1-5 / 6-10)", () => {
  const s1 = officialTaskInventoryFor("2016", 1);
  const s2 = officialTaskInventoryFor("2016", 2);
  assert.equal(s1.status, "partial", "aucun inventaire 2016 n'est complet");
  assert.equal(s2.status, "partial");
  assert.equal(s1.document.pages, 5);
  assert.equal(s2.document.pages, 5);
  assert.equal(s1.document.pageOffset, 0, "sujet 1 = livret 1-5, sans décalage");
  assert.equal(s2.document.pageOffset, 5, "sujet 2 = livret 6-10");
  const total =
    s1.tasks.filter((t) => t.promptSource === "official").length +
    s2.tasks.filter((t) => t.promptSource === "official").length;
  assert.equal(total, CONSIGNES.length);
  for (const task of [...s1.tasks, ...s2.tasks]) {
    if (task.promptSource !== "official") continue;
    assert.ok(Number.isInteger(task.pageInPdf), `${task.id} : page fichier manquante`);
    assert.equal(task.scoringReviewStatus, "provisional", `${task.id} : barème non calibré`);
  }
  // Le sujet 2 reprend la numérotation du livret : 6-10 → 1-5.
  // Q1 = pôle N reconstruit (aucune page) ; Q2 = S (livret 9 → fichier 4) ;
  // Q4 = W (livret 10 → fichier 5).
  assert.equal(s2.tasks.find((t) => t.id === "2016-S2-E3-Q1").pageInPdf, null);
  assert.equal(s2.tasks.find((t) => t.id === "2016-S2-E3-Q2").pageInPdf, 4);
  assert.equal(s2.tasks.find((t) => t.id === "2016-S2-E3-Q4").pageInPdf, 5);
  // Et le sujet 1, qui suit la numérotation du livret sans décalage.
  assert.equal(s1.tasks.find((t) => t.id === "2016-S1-E1-Q2").pageInPdf, 1);
});

test("SE 2016 : la checklist de relecture est jointe et datée du même jour que l'encodage", () => {
  const checklist = readFileSync(new URL("../docs/RELECTURE_SE_2016_CHECKLIST.md", import.meta.url), "utf8");
  assert.match(checklist, /2026-09-23/, "la checklist doit porter la date des deux passes");
  assert.match(checklist, /seconde passe|passe 2/, "la checklist doit attester deux passes");
  assert.match(checklist, /2026-09-24/, "la relecture d'encodage doit être datée dans le journal");
  for (const page of ["1 / 10", "5 / 10", "10 / 10"]) {
    assert.ok(checklist.includes(page), `la checklist doit couvrir la page ${page}`);
  }
});
