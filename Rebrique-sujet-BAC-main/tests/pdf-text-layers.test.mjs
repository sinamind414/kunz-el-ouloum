import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PRESENTATION_FORM_RATIO,
  SCAN_CHAR_THRESHOLD,
  buildPdfTextLayerStatus,
  classifyTextLayer,
  presentationFormRatio
} from "../scripts/report-pdf-text-layers.mjs";

/* Une couche texte trop courte est un scan : il n'y a rien à recopier. */
test("un PDF sans couche texte est classé « scan »", () => {
  const filigraneSeul = "www.dzexams.com ".repeat(8);
  assert.ok(filigraneSeul.length <= SCAN_CHAR_THRESHOLD + 200);
  assert.equal(classifyTextLayer("").classe, "scan");
  assert.equal(classifyTextLayer("b".repeat(SCAN_CHAR_THRESHOLD)).classe, "scan");
});

/* Le défaut le plus traître : les glyphes sont les bons, leur ordre est faux.
   Un classifieur qui ne chercherait que la présence de lettres arabes dirait
   « propre » et laisserait encoder des consignes corrompues. */
test("une couche texte à ligatures inversées est classée « transposé », jamais « propre »", () => {
  const transpose = `اختبار يف مادة : علوم الطبيعة واحلياة ${"x".repeat(400)}`;
  const resultat = classifyTextLayer(transpose);
  assert.equal(resultat.classe, "transposé");
  assert.ok(resultat.transpose > 0, "au moins un marqueur transposé doit être reconnu");
  assert.notEqual(resultat.classe, "propre");
});

test("un encodage en formes visuelles est classé « formes-visuelles »", () => {
  /* U+FE70–U+FEFF : la forme visuelle, pas la lettre logique. */
  const visuel = "\uFE70\uFE71\uFE72\uFE73\uFE74 ".repeat(60);
  assert.ok(presentationFormRatio(visuel) > PRESENTATION_FORM_RATIO);
  assert.equal(classifyTextLayer(visuel).classe, "formes-visuelles");
});

test("une couche texte en arabe logique est classée « propre »", () => {
  const propre = `اختبار في مادة : علوم الطبيعة والحياة الشعبة: علوم تجريبية ${"y".repeat(400)}`;
  const resultat = classifyTextLayer(propre);
  assert.equal(resultat.classe, "propre");
  assert.equal(resultat.transpose, 0);
  assert.ok(resultat.correct >= 2);
});

/* Faille couverte par mutation : si le seuil « propre » tombe à 0 marqueur,
   tout ce qui n'est ni scan ni transposé ni visuel devient « propre », et un
   PDF douteux serait présenté comme relisable. Ce test doit alors tomber. */
test("une couche texte sans marqueur reconnu reste « indéterminé », pas « propre »", () => {
  const douteux = `${"كلمة ".repeat(120)}`;
  const resultat = classifyTextLayer(douteux);
  assert.ok(douteux.length > SCAN_CHAR_THRESHOLD, "le texte est assez long pour ne pas être un scan");
  assert.equal(resultat.correct, 0, "aucun marqueur officiel reconnu");
  assert.equal(resultat.transpose, 0);
  assert.equal(resultat.classe, "indéterminé");
});

/* Garde-fou : « propre » ne veut PAS dire « encodable automatiquement ».
   Si quelqu'un renomne ce champ ou le présente comme une certification,
   ce test doit tomber. */
test("le statut compte les sujets à relecture assistée possible, sans jamais certifier", async () => {
  const status = await buildPdfTextLayerStatus();
  /* 58 sujets = 29 sessions × 2 (SE 2013–2026 + Maths 2013–2026 + la session
     exceptionnelle 2017 Maths). Les armatures « copie libre » Maths 2013–2020
     sont mesurées comme les autres : c'est cette mesure qui a décidé de leur
     découpage (2 exercices ou sujet entier) et de l'absence de barème. */
  assert.equal(status.total, 58, "les 58 sujets du catalogue doivent être mesurés");
  assert.equal(status.exploitable, status.parClasse["propre"] || 0);
  assert.ok(
    status.exploitable < status.total,
    "T3 n'est pas atteint : tous les PDF n'ont pas une couche texte propre"
  );
  const classes = Object.keys(status.parClasse);
  /* Tous les scans et couches brouillées ont été reconstruits en couches
     logiques (batches OCR SE 2013-2026 + M 2013-2026) : il ne reste que du
     « propre » et des « indéterminé » (sujets sans bloc d'en-tête dans le
     scan : plafonds de contenu, pas des défauts de couche). */
  assert.ok(!classes.includes("scan"), "plus aucun scan pur : chaque PDF a une couche texte");
  assert.ok(!classes.includes("transposé"), "plus aucune couche à ligatures inversées");
  assert.ok(!classes.includes("formes-visuelles"), "plus aucun encodage en formes visuelles");
  assert.ok(
    classes.includes("indéterminé"),
    "ce corpus garde des sujets sans marqueurs (plafonds de contenu)"
  );
  for (const sujet of status.sujets) {
    assert.ok(sujet.label && sujet.path, "chaque sujet mesuré doit être identifiable");
    assert.ok(sujet.classe, "chaque sujet mesuré doit être classé");
  }
});
