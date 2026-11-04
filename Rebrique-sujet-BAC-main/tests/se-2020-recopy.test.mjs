/* ============================================================
   SE 2020 — verrou de recopie (Phase 3 du plan SE 2013-2020)
   ------------------------------------------------------------
   Les consignes de `data/years/se/year-2020.js` ont été recopiées mot à
   mot sur l'IMAGE des neuf pages du livret (deux passes, 2026-09-23),
   consignées dans docs/RELECTURE_SE_2020_CHECKLIST.md. Ce fichier fige
   ce qui a été lu, pour qu'une édition future ne dérive pas en silence.

   Ce que ce verrou protège :
     - le texte imprimé, diacritiques compris (شدّة, تنوين, ضمّة) ;
     - la page du LIVRET portée par bacPromptPage (1-9) ;
     - les regroupements assumés (deux phrases imprimées sur un pôle),
       qui ne doivent jamais devenir des phrases inventées ;
     - le 600 du tableau (la couche texte du fichier local écrit 655) ;
     - le fait que 2013-2019 n'a PAS été touché par ce lot.

   Il ne certifie AUCUN barème : scoringReviewStatus reste provisional.
   ============================================================ */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { YEAR_2020_SE } from "../data/years/se/year-2020.js";
import { officialTaskInventoryFor } from "../data/official-tasks.js";

const sujet = (id) => YEAR_2020_SE.sujets.find((s) => s.id === id);
const pole = (sujetId, exNumber, letter) =>
  sujet(sujetId).exercises.find((e) => e.number === exNumber).poles[letter];

/* Texte imprimé, tel que relu sur l'image (passe 2). La puce « . » de
   l'exercice 2 du sujet 2 est imprimée sur la page : elle est conservée. */
const CONSIGNES = [
  [1, 1, "S", 1, "1. أنقل الجدول على ورقة إجابتك ثم املأ الخانات وفق التّعليمات المطلوبة."],
  [
    1,
    1,
    "E",
    1,
    "2. بيّن في نصّ علمي كيف تمّ استغلال المعطيات الزلزالية لمعرفة البنية الداخلية للكرة الأرضية ممّا سبق ومعلوماتك."
  ],
  [
    1,
    2,
    "S",
    2,
    "1. حلّل مخطط الشكل (أ) من الوثيقة (1). 2. وضّح دور دواء إيبوبروفان مبرزا أعراضه الجانبية باستغلالك لمعطيات الوثيقة (1)."
  ],
  [
    1,
    2,
    "E",
    2,
    "1. انطلاقا من الشكل (أ) من الوثيقة (2) علّل : - تأثير الأنزيمين (Cox-1) و(Cox-2) على نفس الركيزة. - تأثير إيبوبروفان على نفس الأنزيمين. 2. فسّر منحنى الشكل (ب) من الوثيقة (2)."
  ],
  [1, 2, "W", 2, "3. اقترح حلا يُبيّن كيفية تخفيف الأعراض الجانبية للأدوية التي تستهدف النشاط الأنزيمي."],
  [1, 3, "N", 3, "فكيف تتدخل الأجسام المضادة في القضاء على هذا النوع من السرطان؟"],
  [
    1,
    3,
    "S",
    3,
    "1- استخرج علاقة بروتين (Her 2) بتطور الخلايا السرطانية للثدي. 2- اقترح فرضية تُبيّن طريقة علاجية للحد من تكاثر خلايا سرطان الثدي."
  ],
  [
    1,
    3,
    "E",
    4,
    "1- حلّل النتائج الموضّحة في الجدول (أ) من الوثيقة (2). 2- فسّر آلية تأثير جزيئة (Trastuzumab) على الخلايا السرطانية باستغلالك لمعطيات الشكلين (ب) و(ج) من الوثيقة (2) مُعلّلا صحة الفرضية المقترحة. 3- قدّم مقترحا حول إمكانية استغلال نتائج هذه الدراسة في الكشف المبكّر عن سرطان الثدي."
  ],
  [
    1,
    3,
    "W",
    4,
    "بيّن من خلال ما سبق ومعلوماتك في نص علمي كيف تتدخل الأجسام المضادة في القضاء على الأجسام الغريبة عموما وخلايا سرطان الثدي على وجه الخصوص."
  ],
  [
    2,
    1,
    "S",
    5,
    "1. سمّ العناصر المرقمة من 01 إلى 06، ثم تعرف على الخليتين (س) و(ع) ونمطي الاستجابة (أ) و (ب)."
  ],
  [
    2,
    1,
    "E",
    5,
    "2. اكتب نصا علميا تبيّن فيه دور ومصدر المستضد في انتقاء اللمفاويات وتحديد نمط الاستجابة المناعية النوعية انطلاقا من معطيات الوثيقة ومكتسباتك."
  ],
  [
    2,
    2,
    "S",
    6,
    ". حلّل الوثيقة (1) مبرزا العلاقة بين تكاثر الخلايا السرطانية المبينة في الشكل (أ) والظواهر الحيوية الموضّحة في الشكل (ب)."
  ],
  [2, 2, "E", 7, ". حلّل منحنيات الشكلين (أ) و (ب) مبرزا المشكلة حول تأثير مادة الريسين على تركيب البروتين."],
  [2, 2, "W", 7, ". أعط حلا للمشكلة المطروحة انطلاقا من استغلالك لمعطيات الوثيقة (3)."],
  [
    2,
    3,
    "S",
    8,
    "1- حلّل معطيات الوثيقة (1) مُحدّدا المشكلة العلمية المطروحة. 2- اقترح فرضية لحل هذه المشكلة."
  ],
  [
    2,
    3,
    "E",
    9,
    "1- استخرج أهم مميزات البروتينات الغشائية الممثلة في الشكل (أ) من الوثيقة (2). 2- تأكد من صحة الفرضية المقترحة باستغلالك لمعطيات الوثيقة (2). 3- قدّم حلا مَبْنِيًّا على أُسُس علمية لعلاج أشخاص بالغين يعانون من اضطرابات عصبية ناتجة عن تراكم شوارد الـ (Cl⁻) في هيولى الخلية بعد مشبكية."
  ],
  [
    2,
    3,
    "W",
    9,
    "لخّص في نص علمي دقيق آلية عمل المشبك المثبط عند شخص سليم بالغ مبرزا دور مختلف البروتينات الغشائية في ذلك باستغلالك لنتائج الدراسة السابقة ومكتسباتك."
  ]
];

test("SE 2020 : les 17 consignes officielles sont figées mot à mot avec leur page de livret", () => {
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
      /RELECTURE_SE_2020_CHECKLIST/.test(p.bacPromptNotes || ""),
      `note de provenance absente pour S${sujetId}/E${exNumber}/${letter}`
    );
  }
});

test("SE 2020 : le nombre de consignes officielles est figé (17/24) et les cadrages restent reconstruits", () => {
  let official = 0;
  let reconstructed = 0;
  for (const s of YEAR_2020_SE.sujets) {
    for (const ex of s.exercises) {
      for (const p of Object.values(ex.poles)) {
        if (p.bacPromptSource === "official") official += 1;
        if (p.bacPromptSource === "reconstructed") reconstructed += 1;
      }
    }
  }
  assert.equal(official, CONSIGNES.length, "toute promotion doit passer par la checklist");
  assert.equal(official + reconstructed, 24, "4 pôles × 3 exercices × 2 sujets");
});

test("SE 2020 : les pôles reconstruits portent une note datée et aucune page inventée", () => {
  for (const s of YEAR_2020_SE.sujets) {
    for (const ex of s.exercises) {
      for (const [letter, p] of Object.entries(ex.poles)) {
        if (p.bacPromptSource !== "reconstructed") continue;
        assert.equal(
          p.bacPromptPage,
          undefined,
          `S${s.id}/E${ex.number}/${letter} ne doit pas avoir de page`
        );
        assert.match(
          p.bacPromptNotes,
          /2026-09-23/,
          `S${s.id}/E${ex.number}/${letter} : note non datée par la passe d'image`
        );
        assert.match(
          p.bacPromptNotes,
          /aucune question imprimée autonome|sans question/,
          `S${s.id}/E${ex.number}/${letter} : la note doit dire pourquoi le pôle n'est pas officiel`
        );
      }
    }
  }
});

test("SE 2020 : les barèmes imprimés 5 / 7 / 8 sont ceux des deux sujets", () => {
  for (const s of YEAR_2020_SE.sujets) {
    assert.deepEqual(
      s.exercises.map((e) => e.max),
      [5, 7, 8],
      `barème lu sur l'image (titres d'exercices), sujet ${s.id}`
    );
  }
});

test("SE 2020 : les deux regroupements assumés sont notés, pas masqués", () => {
  for (const [sujetId, exNumber, letter] of [
    [1, 2, "S"],
    [1, 2, "E"],
    [1, 3, "S"],
    [1, 3, "E"],
    [2, 3, "S"],
    [2, 3, "E"]
  ]) {
    const p = pole(sujetId, exNumber, letter);
    assert.match(
      p.bacPromptNotes,
      /regroup|consignes/,
      `S${sujetId}/E${exNumber}/${letter} : un regroupement de phrases imprimées doit être écrit dans la note`
    );
  }
});

test("SE 2020 : le tableau de l'exercice 3 lit 600 — la valeur 655 de la couche texte est écartée", () => {
  const p = pole(1, 3, "E");
  assert.deepEqual(p.rule.document.values, ["600"], "valeur du tableau relue sur l'image");
  assert.match(p.modelAnswer, /600/, "la réponse modèle doit citer la valeur du tableau");
  assert.doesNotMatch(
    p.modelAnswer,
    /655/,
    "655 est un artefact de la couche texte, pas une donnée imprimée"
  );
});

test("SE 2020 : le générateur rattache les 17 consignes au bon fichier et garde l'inventaire partial", () => {
  const s1 = officialTaskInventoryFor("2020", 1);
  const s2 = officialTaskInventoryFor("2020", 2);
  for (const inv of [s1, s2]) {
    assert.equal(inv.status, "partial", "aucun inventaire 2020 n'est complet");
    assert.equal(inv.document.pageOffset, inv === s1 ? 0 : 4, "livret 1-4 puis 5-9");
  }
  assert.equal(s1.document.pages, 4);
  assert.equal(s2.document.pages, 5);
  const officiellesS1 = s1.tasks.filter((t) => t.promptSource === "official");
  const officiellesS2 = s2.tasks.filter((t) => t.promptSource === "official");
  assert.equal(officiellesS1.length + officiellesS2.length, CONSIGNES.length);
  for (const task of [...officiellesS1, ...officiellesS2]) {
    assert.ok(Number.isInteger(task.pageInPdf), `${task.id} : page fichier manquante`);
    assert.equal(task.scoringReviewStatus, "provisional", `${task.id} : barème non calibré`);
  }
  // Le sujet 2 reprend la numérotation du livret : 5-9 → 1-5.
  assert.equal(s2.tasks.find((t) => t.id === "2020-S2-E3-Q4").pageInPdf, 5);
});

test("SE 2020 : la checklist de relecture est jointe et datée du même jour que l'encodage", () => {
  const checklist = readFileSync(new URL("../docs/RELECTURE_SE_2020_CHECKLIST.md", import.meta.url), "utf8");
  assert.match(checklist, /2026-09-23/, "la checklist doit porter sa date");
  assert.match(checklist, /passe 2|seconde passe/, "la checklist doit attester deux passes");
  for (const page of ["1 / 9", "5 / 9", "9 / 9"]) {
    assert.ok(checklist.includes(page), `la checklist doit couvrir la page ${page}`);
  }
});
