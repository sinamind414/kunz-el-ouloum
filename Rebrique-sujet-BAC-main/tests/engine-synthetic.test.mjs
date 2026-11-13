/* ============================================================
   Tests SYNTHÉTIQUES du moteur à mots-clés — étiquetés comme tels
   ------------------------------------------------------------
   Toutes les réponses de ce fichier sont SYNTHÉTIQUES (écrites
   pour la non-régression du moteur). Aucune d'entre elles n'est
   une copie d'élève réelle : le corpus de calibrage
   (tests/hard-benchmark/cases.json) reste volontairement vide.
   Le score affiché par le moteur est un indicateur de couverture
   méthodologique, pas une note de correction.

   Trois scénarios sur les consignes BAC 2022 réelles (OFFICIAL) :
   (A) bourrage de mots-clés + causalité inversée
       → contradictoire DÉTECTABLE (règle causalOrder) :
         le moteur DOIT plafonner (≤ 0.45, science.errors) ;
   (B) bourrage de mots-clés d'un autre exercice
       → contradictoire DÉTECTABLE (règle wrongConcepts) :
         le moteur DOIT plafonner (≤ 0.45, science.errors) ;
   (C) LIMITE CONNUE documentée : les valeurs attribuées au
       mauvais groupe (absence ↔ présence) ne sont PAS détectées
         (le moteur n'a pas d'accès au sens quantitatif du
         document) ; le test verrouille ce comportement actuel —
         s'il passe vert à rouge un jour, c'est une amélioration :
         il faudra alors le réorienter ;
   (D) paraphrase légitime (synonymes + réorganisation)
       → le moteur NE DOIT PAS pénaliser (≥ 0.60, sans chute
         significative par rapport à la réponse modèle) ;
   (E) variantes orthographiques (ى/ي, ة/ه, hamza, articles)
       → le moteur NE DOIT PAS pénaliser (idem).

   Aucune règle n'est sur-ajustée à ces phrases : les règles
   (causalOrder, wrongConcepts) sont dérivées du corrigé officiel
   2022 (chaîne causale et concept de l'exercice voisin) et les
   assertions codifient des principes généraux (plafond sur
   contradiction détectable, pas de pénalité sur variante
   légitime).
   ============================================================ */
import { test } from "node:test";
import assert from "node:assert/strict";
import { APP_CONFIG } from "./helpers/full-app-config.mjs";
import { evaluateText } from "../js/engine.js";

const y2022 = APP_CONFIG.years.find((y) => y.id === "2022");
const pole = (sujet, exo, lettre) => y2022.sujets[sujet - 1].exercises[exo - 1].poles[lettre];

test("BAC 2022 — structure : 2 sujets × 3 exercices texte (5/7/8) avec source externe", () => {
  assert.ok(y2022, "année 2022 absente du catalogue");
  assert.equal(y2022.enabled, true);
  assert.equal(y2022.sujets.length, 2);
  const expectedMax = [5, 7, 8];
  for (const sujet of y2022.sujets) {
    assert.equal(sujet.exercises.length, 3);
    assert.ok(sujet.pdfExternalUrl.startsWith("https://"), "pdfExternalUrl doit être https");
    assert.ok(sujet.pdfNote.includes("consulté"), "pdfNote doit dater la relecture");
    sujet.exercises.forEach((ex, i) => {
      assert.equal(ex.ui, "text");
      assert.equal(ex.max, expectedMax[i], `exercice ${i + 1} du sujet ${sujet.id}`);
      const sum = ["N", "S", "E", "W"].reduce((acc, l) => acc + ex.poles[l].points, 0);
      assert.ok(Math.abs(sum - ex.max) < 1e-9, `barème ${sum} ≠ ${ex.max}`);
    });
  }
});

test("synthétique (A) — causalité inversée : le moteur plafonne malgré tous les mots-clés présents", () => {
  const e = pole(2, 3, "E"); // 3-NOP / CoEM (consigne OFFICIAL, chaîne causale officielle)
  assert.ok(
    e.rule.causalOrder?.length >= 2,
    "la règle causalOrder doit être ancrée (chaîne officielle du corrigé)"
  );
  const model = evaluateText(e.modelAnswer, e.rule, "E");
  // Phrases de contrôle : la réponse modèle ne doit PAS être jugée inversée.
  assert.ok(
    !model.science.errors.some((x) => x.type === "inverted-causal"),
    "faux positif sur la réponse modèle"
  );
  assert.ok(model.fraction >= 0.95, `réponse modèle fraction=${model.fraction}`);

  // SYNTHÉTIQUE : tous les mots-clés de la règle sont présents, mais le
  // rôle causal est attribué à la mauvaise molécule (CoEM au lieu de 3-NOP)
  // avec connecteurs causaux explicites.
  const stuffed =
    "يأخذ CoEM مكان 3-NOP فتتوقف التفاعلات، مما يؤدي إلى ارتفاع إنتاج الميثان دون التأثير على تركيز CO₂ والأنزيم M، في حين أن 3-NOP يثبّت على أنزيم M.";
  const res = evaluateText(stuffed, e.rule, "E");
  assert.ok(
    res.hits >= res.req,
    `mots-clés présents (hits=${res.hits}/${res.req}) : le plafond doit venir de la contradiction`
  );
  assert.ok(
    res.science.errors.some((x) => x.type === "inverted-causal"),
    "contradiction détectable non signalée"
  );
  assert.ok(res.fraction <= 0.45, `score trop élevé malgré causalité inversée : fraction=${res.fraction}`);
});

test("synthétique (B) — bourrage avec le concept d'un autre exercice : le moteur plafonne (wrongConcepts)", () => {
  const e = pole(2, 1, "E"); // sّيانور / ATP (consigne OFFICIAL)
  assert.ok(
    e.rule.wrongConcepts?.length >= 1,
    "la règle wrongConcepts doit être ancrée (exercice voisin officiel)"
  );
  const model = evaluateText(e.modelAnswer, e.rule, "E");
  assert.ok(model.science.errors.length === 0, "faux positif sur la réponse modèle");
  assert.ok(model.fraction >= 0.95, `réponse modèle fraction=${model.fraction}`);

  // SYNTHÉTIQUE : tous les mots-clés du pôle sّيانور sont présents, mais
  // le concept « gentamisin » (exercice 3 du sujet 1) est injecté.
  const stuffed =
    "السّيانور يمنع تركيب ATP في الليف العصبي، في غياب ATP يتوقف نشاط المضخة فيؤدي تسرب الشوارد عبر القنوات إلى تساوي تركيزها على جانبي الغشاء، كما يمنع الجينتاميسين تركيب البروتين في البكتيريا.";
  const res = evaluateText(stuffed, e.rule, "E");
  assert.ok(res.hits >= res.req, `mots-clés présents (hits=${res.hits}/${res.req})`);
  assert.ok(
    res.science.errors.some((x) => x.type === "wrong-concept"),
    "concept d'un autre exercice non signalé"
  );
  assert.ok(res.fraction <= 0.45, `score trop élevé malgré concept hors-sujet : fraction=${res.fraction}`);

  // Variante latine du même concept (orthographe du sujet officiel).
  const resLatin = evaluateText(stuffed + " gentamicine est un antibiotique.", e.rule, "E");
  assert.ok(
    resLatin.science.errors.some((x) => x.type === "wrong-concept"),
    "variante latine non signalée"
  );
  assert.ok(resLatin.fraction <= 0.45, `variante latine : fraction=${resLatin.fraction}`);
});

test("synthétique (C) — LIMITE CONNUE : valeurs échangées entre absence/présence NON détectées (documenté, non euphémisé)", () => {
  const e = pole(1, 3, "S"); // gentamicine, figures A/B/C (consigne OFFICIAL)
  // SYNTHÉTIQUE : le texte est scientifiquement faux — les valeurs des
  // deux situations sont échangées (13 % en absence au lieu de 100 %,
  // 100 % en présence au lieu de 13 %) — mais chaque mot-clé pris
  // isolément est légitime : le moteur à mots-clés ne peut pas lier
  // une valeur numérique à la situation qu'elle décrit.
  const swapped =
    "في غياب الجینتامسین يبلغ الاندماج 13% من الاندماج الطبيعي ويتناقص عدد المستعمرات، بينما في وجوده عند تركيز 9 µM يبلغ الاندماج 100% وتزداد نسبة التعبير عن اللامينين المكتمل.";
  const res = evaluateText(swapped, e.rule, "S");
  // Ce test verrouille le comportement ACTUEL (non-détection) pour le
  // documenter. S'il échoue un jour, c'est que le moteur est devenu
  // capable de détecter l'échange de valeurs : il faudra réécrire
  // l'assertion en version positive.
  assert.equal(
    res.science.errors.length,
    0,
    "la limite documentée a changé de statut : mettre à jour le test"
  );
  assert.ok(
    res.fraction > 0.45,
    `comportement documenté : fraction=${res.fraction} (score élevé accordé à tort)`
  );
});

test("synthétique (D) — paraphrase légitime (synonymes + réorganisation) : aucune pénalité", () => {
  const e = pole(2, 2, "S"); // α-amanitine / ARN polymérase (consigne OFFICIAL)
  const model = evaluateText(e.modelAnswer, e.rule, "S");
  assert.ok(model.fraction >= 0.95, `réponse modèle fraction=${model.fraction}`);

  // SYNTHÉTIQUE : même contenu scientifique que la réponse modèle, avec
  // des synonymes (تتبدل/إدراج/يتراجع/تثبط), un autre ordre des parties
  // (partie microscopique avant quantitative) et des connecteurs
  // différents. Aucune modification du moteur n'est faite pour ce texte.
  const paraphrase =
    "على المستوى الجزئي: في حالة الغياب تتبدل حلقة TL ضمن أنزيم ARN بوليميراز شكلا ما يسمح بإدراج نيكليوتيدات جديدة في الـ ARNm المتشكلة، أما في وجود α-amanitine فيثبت الأنزيم على الحلقة TL فيحافظ على شكلها فيمنع إدراج نيكليوتيدات جديدة. كميّا: نشاط الـ ARN بوليميراز يبلغ 100% في الغياب ويتراجع إلى 30% عند تركيز 13 µg/ml في وجود α-amanitine، أي أن α-amanitine تثبط نشاط ARN بوليميراز بتثبيته على حلقة TL ما يوقف النسخ.";
  const res = evaluateText(paraphrase, e.rule, "S");
  assert.ok(!res.isKeywordDump, "paraphrase fluide mal classée en « bourrage de mots-clés »");
  assert.ok(res.fraction >= 0.6, `paraphrase légitime pénalisée : fraction=${res.fraction}`);
  assert.ok(
    res.fraction >= model.fraction - 0.15,
    `chute injustifiée : paraphrase=${res.fraction} vs modèle=${model.fraction}`
  );
});

test("synthétique (E) — variantes orthographiques (ى/ي, ة/ه, hamza, article) : aucune pénalité", () => {
  const e = pole(2, 1, "W"); // clôture sّيانور (RECON issue du corrigé officiel)
  const model = evaluateText(e.modelAnswer, e.rule, "W");
  assert.ok(model.fraction >= 0.9, `réponse modèle fraction=${model.fraction}`);

  // SYNTHÉTIQUE : reformulation correcte avec variantes orthographiques
  // normalisables (المواد→مادة, hamza أ/ا, ordre des mots) — le contenu
  // est identique à la clôture officielle.
  const variants =
    "في الختام، السّيانور مادة سامة تؤثر سلبا على صحة الإنسان بتأثيرها على كمون الراحة وبالتالي على قابلية تنبيه الليف العصبي.";
  const res = evaluateText(variants, e.rule, "W");
  assert.ok(res.hits >= res.req, `mots-clés attendus (hits=${res.hits}/${res.req})`);
  assert.ok(res.fraction >= 0.6, `variante orthographique pénalisée : fraction=${res.fraction}`);
  assert.ok(
    res.fraction >= model.fraction - 0.15,
    `chute injustifiée : variante=${res.fraction} vs modèle=${model.fraction}`
  );
});
