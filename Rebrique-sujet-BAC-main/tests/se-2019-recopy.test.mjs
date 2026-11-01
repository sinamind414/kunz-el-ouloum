/* ============================================================
   SE 2019 — verrou de recopie (Phase 3 du plan SE 2013-2020)
   ------------------------------------------------------------
   Les consignes de `data/years/se/year-2019.js` ont été recopiées mot à
   mot sur l'IMAGE des neuf pages du livret (deux passes, 2026-09-23),
   consignées dans docs/RELECTURE_SE_2019_CHECKLIST.md. Ce fichier fige
   ce qui a été lu.

   Deux choses sont protégées ici, et la seconde compte autant que la
   première :
     1. le texte imprimé, diacritiques compris, et sa page de livret ;
     2. la RÉÉCRITURE des six exercices : l'année était encodée sur des
        thèmes pédagogiques qui ne correspondaient pas aux pages (S1-E1
        portait « الاستنساخ » là où la page imprime la مغماتية المرتبطة
        بالظهرة). Un futur retour en arrière doit casser ce test.

   Il ne certifie AUCUN barème : scoringReviewStatus reste provisional.
   ============================================================ */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { YEAR_2019_SE } from "../data/years/se/year-2019.js";
import { officialTaskInventoryFor } from "../data/official-tasks.js";

const sujet = (id) => YEAR_2019_SE.sujets.find((s) => s.id === id);
const ex = (sujetId, exNumber) => sujet(sujetId).exercises.find((e) => e.number === exNumber);
const pole = (sujetId, exNumber, letter) => ex(sujetId, exNumber).poles[letter];

/* Texte imprimé, tel que relu sur l'image (passe 2). La puce « . » n'est
   pas imprimée en 2019 (contrairement à 2020) : les consignes commencent
   par le numéro de question. */
const CONSIGNES = [
  [1, 1, "S", 1, "1- تَعَرَّفْ على البيانات المرقمة من 1 إلى 8."],
  [
    1,
    1,
    "E",
    1,
    "2- قَدِّمْ في نص علمي الأدلة التي تُبَيِّنُ أن مناطق التباعد مرتبطة بمغماتية نشطة مستغلا معطيات الوثيقة ومعلوماتك."
  ],
  [1, 2, "N", 1, "فَهَلْ كل اختلاف في بنية الأنزيمات يؤدي حتما إلى اختلاف في وظائفها؟"],
  [
    1,
    2,
    "S",
    2,
    "1- اسْتَخْرِجْ الخطوات العملية المتبعة التي تسمح بحل المشكلة المطروحة انطلاقا من معطيات الوثيقة (1)."
  ],
  [1, 2, "E", 2, "2- قارن بين الخصائص البنيوية لأنزيم GO عند الفطرين."],
  [
    1,
    2,
    "W",
    3,
    "2- قَدِّمْ إجابة ملخصة للمشكلة العلمية المطروحة في بداية التمرين انطلاقا مما توصلت إليه في هذه الدراسة."
  ],
  [
    1,
    3,
    "S",
    4,
    "1- حَدِّدْ دور الخلايا المناعية المتدخلة في الاستجابة المناعية ضد الخلايا السرطانية الممثلة في الوثيقة (1). 2 - اقْتَرِحْ فرضيتين لتفسير إفلات بعض الخلايا السرطانية من الجهاز المناعي."
  ],
  [
    1,
    3,
    "E",
    5,
    "1- فَسِّرْ إفلات وعدم إفلات الخلايا الورمية من الجهاز المناعي الطبيعي مُبْرِرًا دور البروتينات في ذلك ثم بَيِّن الفرضية الأكثر وجاهة. 2- استنتِجْ بأن التدخل العلاجي غير فعال دوما ضد السرطان ثم قدم نصيحة وقائية لتفادي تطور هذا المرض."
  ],
  [
    1,
    3,
    "W",
    5,
    "لَخِّصْ في مخطط مراحل الاستجابة المناعية ضد الخلايا السرطانية اعتمادا على مكتسباتك ومُوَظِّفًا المعلومات التي توصلت إليها من هذه الدراسة."
  ],
  [2, 1, "S", 6, "1- سمّ العناصر المرقمة وتعرّف على هذا النّشاط التكتوني."],
  [2, 1, "E", 6, "2- اشرح في نصّ علمي كيف تشكّل البركان الانفجاري معتمدا على معطيات الوثيقة ومكتسباتك."],
  [
    2,
    2,
    "S",
    7,
    "1- مَثِّلْ بيانيا ثم حَلِّلْ النتائج المُوضَحة في الوثيقة (1). (يُعطى مقياس الرسم التالي: 1cm ← 0,5ms / 1cm ← 20mv)."
  ],
  [
    2,
    2,
    "E",
    7,
    "1- حَدِّدْ أهم مُمَيِّزات القنوات المُمَثَّلة في الشكل (أ) ثم علّل تسميتها. 2- فَسِّرْ باستغلال معطيات شكلي الوثيقة (2) تأثير الكمون المفروض على القنوات الفولطية في غياب مادة الـ DDT."
  ],
  [
    2,
    2,
    "W",
    7,
    "3- ناقش صحة إحدى الفرضيتين المقترحتين انطلاقا من النتائج السابقة، مُبَيِّنًا آلية تأثير مادة الـ DDT على النشاط العصبي."
  ],
  [
    2,
    3,
    "S",
    8,
    "1. حَلِّلْ النتائج المُمَثَّلة في الشكل (أ) من الوثيقة (1). 2. اقترح باستغلال مُعطيات الشكل (ب) من الوثيقة (1) ثلاث فرضيات تُحدِّد من خلالها مستوى تأثير المضاد الحيوي (Rifamycine) على تركيب البروتين."
  ],
  [
    2,
    3,
    "E",
    9,
    "1- قارن بين النتائج التجريبية الممثلة في الشكل (أ) للوثيقة (2). 2- ناقش باستغلال معطيات الوثيقة (2) صحة إحدى الفرضيات المقترحة سابقا محددا بدقة مستوى تأثير المضاد الحيوي (Rifamycine)."
  ],
  [
    2,
    3,
    "W",
    9,
    "لَخِّصْ في نص علمي من خلال ما سبق ومعلوماتك مراحل تركيب البروتين مبرزا المستويات المحتملة لتأثير مختلف المضادات الحيوية."
  ]
];

test("SE 2019 : les 17 consignes officielles sont figées mot à mot avec leur page de livret", () => {
  for (const [sujetId, exNumber, letter, page, texte] of CONSIGNES) {
    const p = pole(sujetId, exNumber, letter);
    assert.equal(p.bacPromptSource, "official", `S${sujetId}/E${exNumber}/${letter} doit être official`);
    assert.equal(p.bacPrompt, texte, `texte de S${sujetId}/E${exNumber}/${letter}`);
    assert.equal(p.bacPromptPage, page, `page de S${sujetId}/E${exNumber}/${letter}`);
    assert.equal(
      p.bacPromptVerifiedAt,
      "2026-09-23",
      `date de relecture de S${sujetId}/E${exNumber}/${letter}`
    );
    assert.ok(
      /RELECTURE_SE_2019_CHECKLIST/.test(p.bacPromptNotes || ""),
      `note de provenance absente pour S${sujetId}/E${exNumber}/${letter}`
    );
  }
});

test("SE 2019 : 17 consignes officielles et 7 cadrages reconstruits, pas un de plus", () => {
  let official = 0;
  let reconstructed = 0;
  for (const s of YEAR_2019_SE.sujets) {
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

test("SE 2019 : les six exercices portent le thème imprimé sur la page, pas l'ancien thème pédagogique", () => {
  /* Régression du défaut majeur de cette année : les six exercices étaient
     encodés sur d'autres sujets que ceux imprimés. Les libellés ci-dessous
     sont ceux de la checklist ; l'ancien encodage est cité en commentaire. */
  const THEMES = [
    [1, 1, "المغماتية المرتبطة بالظهرة وسط محيطية"], // était : الاستنساخ وتركيب ARNm
    [1, 2, "أنزيم غلوكوز أكسيداز: البنية والوظيفة"], // était : الموقع الفعال والتخصص الإنزيمي
    [1, 3, "الاستجابة المناعية ضد الخلايا السرطانية"], // était : الاستجابة المناعية النوعية
    [2, 1, "الأنديز: منطقة غوص وبركان انفجاري"], // était : كمون العمل والقنوات الفولطية
    [2, 2, "مادة الـ DDT والقنوات الفولطية"], // était : التنفس الخلوي والحصيلة الطاقوية
    [2, 3, "المضادات الحيوية وتركيب البروتين"] // était : التكتونية العامة للصفائح
  ];
  for (const [sujetId, exNumber, label] of THEMES) {
    assert.equal(ex(sujetId, exNumber).label, label, `label S${sujetId}/E${exNumber}`);
  }
  const interdits = ["الاستنساخ", "التنفس الخلوي", "التكتونية العامة"];
  for (const s of YEAR_2019_SE.sujets) {
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

test("SE 2019 : les barèmes imprimés 5 / 7 / 8 sont ceux des deux sujets", () => {
  for (const s of YEAR_2019_SE.sujets) {
    assert.deepEqual(
      s.exercises.map((e) => e.max),
      [5, 7, 8],
      `barème lu sur l'image (titres d'exercices), sujet ${s.id}`
    );
    for (const e of s.exercises) {
      const sum = Object.values(e.poles).reduce((total, p) => total + p.points, 0);
      assert.ok(Math.abs(sum - e.max) < 1e-6, `somme ${sum} ≠ max ${e.max} pour S${s.id}/E${e.number}`);
    }
  }
});

test("SE 2019 : les sept cadrages reconstruits portent une note datée et aucune page", () => {
  for (const s of YEAR_2019_SE.sujets) {
    for (const e of s.exercises) {
      for (const [letter, p] of Object.entries(e.poles)) {
        if (p.bacPromptSource !== "reconstructed") continue;
        assert.equal(p.bacPromptPage, undefined, `S${s.id}/E${e.number}/${letter} ne doit pas avoir de page`);
        assert.match(p.bacPromptNotes, /2026-09-23/, `S${s.id}/E${e.number}/${letter} : note non datée`);
        assert.match(
          p.bacPromptNotes,
          /aucune question imprimée autonome|Clôture pédagogique|Cadrage pédagogique/,
          `S${s.id}/E${e.number}/${letter} : la note doit dire pourquoi le pôle n'est pas officiel`
        );
      }
    }
  }
});

test("SE 2019 : les regroupements de phrases imprimées sont écrits dans la note", () => {
  for (const [sujetId, exNumber, letter] of [
    [1, 2, "S"],
    [1, 3, "S"],
    [1, 3, "E"],
    [2, 2, "E"],
    [2, 3, "S"],
    [2, 3, "E"]
  ]) {
    assert.match(
      pole(sujetId, exNumber, letter).bacPromptNotes,
      /regroup/,
      `S${sujetId}/E${exNumber}/${letter} : regroupement non noté`
    );
  }
});

test("SE 2019 : le générateur rattache les 17 consignes au bon fichier (livret 1-5 / 6-9)", () => {
  const s1 = officialTaskInventoryFor("2019", 1);
  const s2 = officialTaskInventoryFor("2019", 2);
  assert.equal(s1.status, "partial", "aucun inventaire 2019 n'est complet");
  assert.equal(s2.status, "partial");
  assert.equal(s1.document.pages, 5);
  assert.equal(s2.document.pages, 4);
  assert.equal(s1.document.pageOffset, 0, "sujet 1 = livret 1-5, sans décalage");
  assert.equal(s2.document.pageOffset, 5, "sujet 2 = livret 6-9");
  const total =
    s1.tasks.filter((t) => t.promptSource === "official").length +
    s2.tasks.filter((t) => t.promptSource === "official").length;
  assert.equal(total, CONSIGNES.length);
  for (const task of [...s1.tasks, ...s2.tasks]) {
    if (task.promptSource !== "official") continue;
    assert.ok(Number.isInteger(task.pageInPdf), `${task.id} : page fichier manquante`);
    assert.equal(task.scoringReviewStatus, "provisional", `${task.id} : barème non calibré`);
  }
  // Le sujet 2 reprend la numérotation du livret : 6-9 → 1-4.
  assert.equal(s2.tasks.find((t) => t.id === "2019-S2-E3-Q4").pageInPdf, 4);
});

test("SE 2019 : la checklist de relecture est jointe et datée du même jour que l'encodage", () => {
  const checklist = readFileSync(new URL("../docs/RELECTURE_SE_2019_CHECKLIST.md", import.meta.url), "utf8");
  assert.match(checklist, /2026-09-23/, "la checklist doit porter sa date");
  assert.match(checklist, /seconde passe|passe 2/, "la checklist doit attester deux passes");
  for (const page of ["1 / 9", "5 / 9", "9 / 9"]) {
    assert.ok(checklist.includes(page), `la checklist doit couvrir la page ${page}`);
  }
});
