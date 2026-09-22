// scripts/check-miftah.ts
// Garde-fou MARQUE — prouve la cohérence fiche ↔ spec ↔ carte React ↔ vue compilateur.
// Référence : docs/MARQUE.md (document de décision). Exécution : npm run check:miftah
//
// Ce que le script protège :
//   §3 nom verrouillé      : « المفتاح » (usage) / « مفتاح المنهجية » (officiel),
//                            variantes latines et « مفتاح الكنز » bannies de l'UI
//   §4 règle de placement  : les deux noms jamais ensemble hors en-tête de la fiche
//   §10 bugs corrigés      : السنّ 0 → القفل, erreurs 1-3 sur le recto, garde-fou A4
//   §13 (2026-09-15)       : le nom officiel n'existe qu'une fois dans le code
//                            (miftahSpec.MIFTAH_NAME_OFFICIAL_AR) — les 4 vues UI
//                            l'importent et n'en écrivent jamais le littéral
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// M4 (audit 2026-09-19) : le garde-fou porte désormais des ASSERTIONS PÉDAGOGIQUES
// (sommes de barèmes, parité dictionnaire ↔ Meftah, complétude du registre) —
// plus seulement la marque.
import {
  ATTENDUS_BAC2025,
  attendusDeGroupe,
  plafondAutoDe,
  type SujetId,
  type ExerciceId,
} from '../src/data/dictionaries/attendusBac2025';
import { MEFTA_BAC_EXERCISES, MIFTAH_MANHAJIA_VERSION } from '../src/data/meftahManhajia';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const html = read('public/miftah.html');
const card = read('src/components/MiftahCard.tsx');
const spec = read('src/data/miftahSpec.ts');
const compiler = read('src/components/MethodologyCompilerView.tsx');
// Vues UI qui portent le nom officiel (owner 2026-09-15) — §13
const app = read('src/App.tsx');
const dashboard = read('src/components/DashboardView.tsx');
const meftah = read('src/components/MeftahView.tsx');
const manhajia = read('src/data/meftahManhajia.ts');

// Découpe la fiche : recto = avant le commentaire « <!-- VERSO --> »
// (marqueur v6.0 — 2 cartes ; l'ancien marqueur « الوجه الثاني » appartenait à la fiche v3.x)
const versoIdx = html.indexOf('<!-- VERSO -->');
if (versoIdx <= 0) {
  console.error('✗ impossible de découper le recto/verso de public/miftah.html (marqueur <!-- VERSO --> absent)');
  process.exit(1);
}
const recto = html.slice(0, versoIdx);
const verso = html.slice(versoIdx);

let failures = 0;
const ok = (label: string) => console.log(`  ✓ ${label}`);
const fail = (label: string) => {
  failures++;
  console.error(`  ✗ ${label}`);
};
const must = (hay: string, needle: string, label: string) => (hay.includes(needle) ? ok(label) : fail(label));
const mustNot = (hay: string, needle: string, label: string) =>
  hay.includes(needle) ? fail(label) : ok(label);

console.log('Garde-fou MARQUE — référence : docs/MARQUE.md');

console.log('\n§ Spec — source unique (miftahSpec.ts)');
must(spec, "MIFTAH_NAME_OFFICIAL_AR = 'مفتاح المنهجية'", 'nom officiel figé');
must(spec, "MIFTAH_NAME_AR = 'المفتاح'", "nom d'usage figé");
must(spec, "NARRATIVE_AR = 'كنز العلوم يُفتح بمفتاح المنهجية'", 'phrase-récit figée');
must(spec, "POSITIONING_AR = 'المقرر موجود عندك. المفتاح يحوّله إلى نقاط.'", 'positionnement figé');
must(spec, "qafal: 'القفل'", 'nomenclature : القفل');
must(spec, 'FOOTER_RECTO_AR', 'constante footer recto');
must(spec, 'FOOTER_VERSO_AR', 'constante footer verso');
must(spec, 'RECTO_ERRORS = FIVE_COSTLY_ERRORS.slice(0, 3)', 'partition recto/verso des erreurs');
must(spec, "chain: ['القفل · اِفهم'", 'chaîne de synthèse : nœud القفل');
const errorsBlock = spec.match(/FIVE_COSTLY_ERRORS = \[([\s\S]*?)\] as const;/);
if (errorsBlock) {
  const items = (errorsBlock[1].match(/'[^']+'/g) ?? []).map(s => s.slice(1, -1));
  if (items.length === 5 && items.every(x => x.includes(' — '))) ok('5 erreurs, chacune « titre — explication » (rendu <b> OK)');
  else fail(`liste des 5 erreurs invalide (${items.length} items)`);
} else {
  fail('FIVE_COSTLY_ERRORS introuvable dans la spec');
}

console.log('\n§ Fiche v6.0 — recto (public/miftah.html, MARQUE §14)');
must(recto, '<title>المفتاح · مفتاح المنهجية — علوم الطبيعة والحياة · بكالوريا الجزائر', 'title : fiche v6.0');
must(recto, '<h2>المفتاح — قبل أن أكتب، أعرف ماذا أُنتج', 'h2 recto : sous-titre v6');
must(recto, '<b>كنز العلوم</b>', 'marquage de la marque (signature .app)');
must(recto, 'v6.0 · fiche élève', 'version v6.0 (en-tête recto)');
must(recto, 'فعل · دليل · علاقة · جواب · فحص', 'chaîne des 5 gestes (§14)');
must(recto, 'بوصلة 20–30 ثانية', 'boosula 20–30 s (compass)');
must(recto, 'علامة أمان', 'table des 5 mouvements : علامة أمان');
must(recto, 'العائلات الثلاث', 'section ب : les 3 familles');
must(recto, 'أصف', 'famille 1 : أصف');
must(recto, 'أقرأ', 'famille 2 : أقرأ');
must(recto, 'أحكم', 'famille 3 : أحكم');
must(recto, 'فحص 10 ثوانٍ', 'section هـ : فحص 10 s (ceinture — option α §14)');
must(recto, 'ثلاثة فخاخ متكررة', '3 pièges récurrents');
must(recto, 'الوجه الأول — النواة', 'footer recto (fiche 2 cartes)');
mustNot(recto, 'شجرة نسب بحكم واحد', 'arbre à verdict unique retiré (arbitrage 2)');
mustNot(recto, 'السنّ 0', '« السنّ 0 » banni');
mustNot(recto, 'مفتاح الكنز', 'variante « مفتاح الكنز » bannie');
mustNot(html, 'MIFTAH', 'latin « MIFTAH » banni de la fiche');

console.log('\n§ Fiche v6.0 — verso (المفتاح+ : référence avancée)');
must(verso, '<h2>المفتاح+ — عندما يصبح السؤال مركّبًا', 'h2 : المفتاح+ (v6)');
must(verso, 'Carte de décision', 'section أ : carte de décision');
must(verso, 'تحليل السند', 'section ب : تحليل السند');
must(verso, 'المتغيرات الأربعة', 'section ج : carte 4 variables');
must(verso, 'فرضية ثم مواجهة ثم قرار', 'section د : أحكم (فرضية → قرار)');
must(verso, 'التركيب —', 'section هـ : التركيب');
must(verso, 'règles rouges', 'section و : règles rouges');
must(verso, 'Sprint 60 secondes', 'section ز : sprint 60 s');
must(verso, 'الوجه الثاني — مرجع متقدم', 'footer verso (fiche 2 cartes)');
mustNot(verso, 'السنّ 0', '« السنّ 0 » banni');
mustNot(verso, 'الحدّاد', 'الحدّاد retiré de la fiche élève (arbitrage 3)');

console.log('\n§ Fiche v6.0 — garde-fou A4 (2 cartes / 2 pages, 210 × 297 mm)');
must(html, 'size:210mm 297mm', 'print : format A4 (210 × 297 mm, @page)');
must(html, 'page-break-before:always', 'verso : saut de page forcé (.break)');
must(html, '@media print', 'print : bloc @media print présent');

console.log('\n§ Carte React (MiftahCard.tsx) — parité avec la fiche');
mustNot(card, '>MIFTAH', 'latin « MIFTAH » banni de la carte');
mustNot(card, 'MIFTAH v', 'latin « MIFTAH v…» banni des footers');
mustNot(card, 'MIFTAH+', 'latin « MIFTAH+ » banni');
mustNot(card, 'مفتاح الكنز', 'variante « مفتاح الكنز » bannie');
mustNot(card, 'السنّ 0', '« السنّ 0 » banni');
must(card, '{MIFTAH_NAME_AR}', 'h1 rendu depuis la constante');
must(card, '{MIFTAH_NAME_OFFICIAL_AR}', 'sous-titre rendu depuis la constante');
must(card, '<footer>{FOOTER_RECTO_AR}</footer>', 'footer recto rendu depuis la constante');
must(card, '{FOOTER_VERSO_AR}', 'footer verso rendu depuis la constante');
must(card, 'RECTO_ERRORS.map', 'erreurs 1-3 rendues depuis la spec');
must(card, 'VERSO_ERRORS.map', 'erreurs 4-5 rendues depuis la spec');
must(card, 'القفل — اِفهم', 'h3 : « القفل — اِفهم »');
must(card, 'font-size:10.4px', 'print : parité du resserré A4');

console.log('\n§ Vue compilateur (MethodologyCompilerView.tsx)');
mustNot(compiler, 'مفتاح الكنز', 'variante « مفتاح الكنز » bannie');
mustNot(compiler, '(MIFTAH)', 'latin « (MIFTAH) » banni des onglets');
must(compiler, '{MIFTAH_NAME_OFFICIAL_AR} v{MIFTAH_VERSION}', 'h1 : nom officiel (la marque se présente)');

console.log('\n§ Version — cohérence spec ↔ fiche');
const m = spec.match(/MIFTAH_VERSION = '([\d.]+)'/);
if (m) {
  const v = m[1];
  must(html, `v${v}`, `fiche : version v${v} (header)`);
  must(card, 'MIFTAH_VERSION', 'carte : version importée de la spec');
} else {
  fail('MIFTAH_VERSION introuvable dans la spec');
}

console.log('\n§ Décisions d\'audit (docs/MARQUE.md §11 — fiche ك, sémantique 12/12)');
must(spec, "goal: '12/12 على ثلاثة أيام مختلفة'", 'spec : DRILL.goal = 3 jours distincts');
must(spec, 'UNLOCK_RULE', 'spec : constante UNLOCK_RULE');
mustNot(spec, 'ثلاث مرات متتالية', 'spec : « متتالية » bannie');
// fiche ك (12/12 · badge « حامل المفتاح » · déverrouillage) : retirée de la fiche
// élève (v5.0 → v6.0, §14) — les assertions DRILL restent sur spec + carte React (ci-dessous).
mustNot(html, 'ثلاث مرات متتالية', 'fiche : « متتالية » bannie');
must(card, '12/12 على ثلاثة أيام مختلفة', 'carte React : drill 12/12 ×3 (app inchangée)');

console.log('\n§ Update 2026-09-06 (docs/MARQUE.md §12) — 3 portes + dents : l’app affiche les gestes v6 sur les dents, la fiche v6.0 les porte aussi (MARQUE §14)');
// Terminologie : libellés des dents = gestes v6 (فعل/دليل/علاقة/جواب) depuis MARQUE §14 (2026-09-22) —
// les constantes restent dans la spec pour l’app, sans verrou de marque.
must(spec, 'KEY_MNEMONIC_AR', 'spec : phrase-mnémotechnique figée');
must(spec, 'bawaba1: \'البوابة 1 — الوجود (قفل أم لا؟)\'', 'spec : porte 1 = الوجود (chiffres latins)');
must(spec, 'bawaba3: \'البوابة 3 — الحركة (📷 أم 🎬 أم 🔨؟)\'', 'spec : porte 3 = الحركة (3 issues, chiffres latins)');
must(spec, "smith: { id: 'smith' as const, labelAr: '🔨 الحدّاد'", 'spec : mouvement 🔨 الحدّاد');
must(card, '🔍 فعل', 'carte : dents = gestes v6 (MARQUE §14)');
mustNot(card, 'تَبَصَّر', 'carte : ancien libellé dent retiré (§14)');
mustNot(compiler, 'تَبَصَّر', 'compilateur : ancien libellé dent retiré (§14)');
must(card, '🔨 الحدّاد', 'carte : parité 3e issue');
mustNot(card, 'اِقْرَأْ', 'carte : anciens noms bannis');
must(compiler, 'البوابة 1 — قفل أصلا؟', 'vue : porte 1 = l’existence (chiffres latins, règle app)');
must(compiler, 'البوابة 3 — أي حركة يطلب هذا القفل؟', 'vue : porte 3 = le mouvement (chiffres latins, règle app)');
must(compiler, 'gate3Choice', 'vue : choix ternaire 📷/🎬/🔨 tracé');
mustNot(card, 'البوابات الثلاث', 'carte : titre « 3 portes » banni (09-07)');
must(card, 'عائلتي قبل أن أكتب', 'carte : ligne famille');
must(compiler, '3 بوابات', 'vue : header 3 portes');
mustNot(compiler, '2 بوابتان', 'vue : « 2 بوابتان » banni');
console.log('\n§ Addendum 2026-09-07 (docs/MARQUE.md §12bis) — fiche (v5.0 → v6.0 §14) : noyau en mouvements ; l’app garde la carte');
mustNot(html, '11 éléments', 'fiche : plus de noyau à 11 cases (3 piliers × 5 mouvements — §13bis)');
must(card, '11 éléments', 'carte app : noyau = 11 (inchangée — arbitrages 2-3)');
mustNot(html, 'الحدّاد', 'fiche : الحدّاد retiré (réservé au guide enseignant — arbitrage 3)');
must(card, 'الحدّاد', 'carte app : الحدّاد = 3e forme spéciale (inchangée)');
mustNot(recto, 'تعرّف', 'fiche : nom dent 1 (09-06) banni — collision عَرِّفْ');
mustNot(card, 'تعرّف', 'carte : nom dent 1 (09-06) banni — collision عَرِّفْ');
console.log('\n§ Addendum 2026-09-07 (docs/MARQUE.md §12ter) — annexe PRO : retirée de la fiche élève (dépréciée §13bis)');
must(spec, 'MIFTAH_ANNEXE_AR', 'spec : constante nom annexe (drapeau mort — app inchangée)');
must(spec, 'ANNEXE = {', 'spec : contenu annexe centralisé (drapeau mort)');
must(spec, 'FOOTER_ANNEXE_AR', 'spec : footer annexe (drapeau mort)');
must(spec, "ruleAr: 'لا أبحث عن جواب فقط", 'spec : règle d’or annexe (drapeau mort)');
mustNot(html, 'المفتاح PRO', 'fiche : annexe PRO retirée (2 faces, plus de page 3)');
mustNot(html, 'لا أبحث عن جواب فقط', 'fiche : règle d’or annexe hors fiche élève');
must(html, 'قاعدة ذهبية', 'fiche : règle d’or portée par l’outil/section أ (analyse ≠ conclusion)');
must(verso, 'المتغيّر المختبَر', 'fiche : 4 questions expérience (section ج v6)');
mustNot(html, 'نقترح أن', 'fiche : template hypothèse v3.3 (س) déprécié — fiche = protocole de validation');
mustNot(html, 'عند الطلب', 'fiche : plus de « distribution sur demande » (annexe hors fiche élève)');
mustNot(html, '11 عنصرًا', 'fiche : footer recto v3.3 « 11 عنصرًا » abandonné (noyau mouvements)');
mustNot(html, '≈ 21', 'fiche : échelle amritat (annexe) retirée de la fiche élève');
must(card, '{ANNEXE.ruleAr}', 'carte app : règle d’or rendue depuis la spec (inchangée)');
must(card, '{ANNEXE.causalAr}', 'carte app : règle rouge rendue depuis la spec (inchangée)');
must(card, 'FOOTER_ANNEXE_AR', 'carte app : footer annexe depuis la spec (inchangée)');
mustNot(verso, 'علوم الطبيعة والحياة', 'fiche : matière hors verso (N12 — nommée une fois dans l’en-tête recto)');
must(recto, 'علوم الطبيعة والحياة', 'fiche recto : matière nommée dans l’en-tête (N12)');
mustNot(card, 'علوم الطبيعة والحياة', 'carte : nom de série ≠ matière banni');
must(spec, "hamad: {", 'spec : SPECIAL_FORMS + الحدّاد (drapeau mort — parité carte)');
must(spec, "countAr: '≈ 21'", 'spec : LEVELS amritat ≈ 21 (drapeau mort — parité carte)');
console.log('\n§ v3.3 → v5.0 → v6.0 (docs/MARQUE.md §13bis / §14) — dictionnaire v3.3 déprécié : les 5 mouvements remplacent les 11 cases');
must(spec, "MIFTAH_VERSION = '6.0'", 'spec : version fiche = 6.0 (§14)');
must(spec, 'TOOTH3_ROUTE_AR', 'spec : route dent 3 (drapeau mort — carte app inchangée)');
must(spec, 'GOLDEN_FORMULA_AR', 'spec : formule dorée (drapeau mort — carte app inchangée)');
mustNot(html, 'معطى ← مقارنة ← علاقة ← تفسير', 'fiche v5.0 : route dent 3 (ز) dépréciée (arbitrage 1)');
mustNot(html, 'تُظهر الوثيقة', 'fiche v5.0 : formule dorée v3.3 dépréciée (arbitrage 1)');
must(card, '{GOLDEN_FORMULA_AR}', 'carte app : formule dorée depuis la spec (inchangée)');
must(card, '{TOOTH3_ROUTE_AR}', 'carte app : route dent 3 depuis la spec (inchangée)');
mustNot(html, '3</b> = <b>المعالجة</b>', 'fiche v5.0 : حدّاد en 3 phases retiré (arbitrage 3)');
must(card, '3</b> = <b>المعالجة</b>', 'carte app : حدّاد 3 phases (inchangée)');
must(spec, '3 = المعالجة', 'spec : SPECIAL_FORMS.hamad 3 phases (drapeau mort)');
mustNot(html, 'V4.1', 'fiche : « V4.1 » banni (version fork non adoptée)');
mustNot(card, 'V4.1', 'carte : « V4.1 » banni');

console.log('\n§ 13 (2026-09-15) — nom officiel : constante unique, zéro littéral dans les vues UI');
// Le nom officiel figé (§3) ne doit exister qu'une fois dans le code : MIFTAH_NAME_OFFICIAL_AR.
// Littéral dupliqué ici à dessein : si la spec change de nom, ce bloc doit échouer.
const OFFICIAL_NAME = 'مفتاح المنهجية';
must(app, 'MIFTAH_NAME_OFFICIAL_AR', 'App.tsx : importe la source unique');
mustNot(app, OFFICIAL_NAME, 'App.tsx : aucun littéral du nom officiel');
must(app, "currentTab === 'methodology' ? MIFTAH_NAME_OFFICIAL_AR", 'en-tête : libellé depuis la constante');
must(app, '<span>{MIFTAH_NAME_OFFICIAL_AR}</span>', 'menu latéral : libellé depuis la constante');
must(app, 'text-center">{MIFTAH_NAME_OFFICIAL_AR}</span>', 'barre mobile : libellé depuis la constante');
must(dashboard, 'MIFTAH_NAME_OFFICIAL_AR', 'DashboardView : importe la source unique');
mustNot(dashboard, OFFICIAL_NAME, 'DashboardView : aucun littéral du nom officiel');
must(dashboard, '🔑 {MIFTAH_NAME_OFFICIAL_AR} (ICM', 'carte dashboard : libellé depuis la constante');
must(meftah, 'MIFTAH_NAME_OFFICIAL_AR', 'MeftahView : importe la source unique');
mustNot(meftah, OFFICIAL_NAME, 'MeftahView : aucun littéral du nom officiel');
must(meftah, '{MIFTAH_NAME_OFFICIAL_AR} · 4', 'sous-titre Meftah : libellé depuis la constante');
must(compiler, 'MIFTAH_NAME_OFFICIAL_AR', 'compilateur : importe la source unique');
mustNot(compiler, OFFICIAL_NAME, 'compilateur : aucun littéral du nom officiel');
must(compiler, '🔑 {MIFTAH_NAME_OFFICIAL_AR} v{MIFTAH_VERSION}', 'header compilateur : libellé depuis la constante');
// Cardinalité : les 3 emplacements App.tsx (en-tête ternaire + menu latéral + barre mobile)
const appUses = (app.match(/\{MIFTAH_NAME_OFFICIAL_AR\}/g) ?? []).length;
if (appUses === 2 && app.includes("? MIFTAH_NAME_OFFICIAL_AR :")) {
  ok('App.tsx : 3 emplacements (2 interpolations + ternaire d’en-tête)');
} else {
  fail(`App.tsx : ${appUses} interpolation(s) — attendu 2, plus le ternaire d’en-tête`);
}

console.log('\n§ Versions (M3 — une constante par artefact, zéro littéral dérivé)');
must(spec, "MIFTAH_VERSION = '6.0'", 'spec : version fiche = 6.0 (constante unique)');
if (MIFTAH_MANHAJIA_VERSION !== '4.3') fail(`manhajia : MIFTAH_MANHAJIA_VERSION = ${MIFTAH_MANHAJIA_VERSION} (attendu 4.3)`);
else ok('manhajia : MIFTAH_MANHAJIA_VERSION = 4.3 (constante unique)');
must(manhajia, "MIFTAH_MANHAJIA_VERSION = '4.3'", 'meftahManhajia : la constante est déclarée');
mustNot(manhajia, 'V4.3', 'meftahManhajia : aucun littéral V4.3 (commentaires compris)');
mustNot(meftah, 'V4.3', 'MeftahView : aucun littéral V4.3');

console.log('\n§ Assertions pédagogiques (M4 — audit 2026-09-19)');

// 1. Barèmes Meftah : ventilation par question = total de l'exercice = 5/7/8.
const pts = (s: string) => Math.round(Number(s.replace(/[^\d.]/g, '')) * 100) / 100;
for (const ex of MEFTA_BAC_EXERCISES) {
  const sommeQ = Math.round(ex.questions.reduce((s, q) => s + pts(q.pointsLabel), 0) * 100) / 100;
  if (sommeQ === pts(ex.pointsLabel)) ok(`Meftah ${ex.id} : Σ questions ${sommeQ} = ${ex.pointsLabel}`);
  else fail(`Meftah ${ex.id} : Σ questions ${sommeQ} ≠ ${ex.pointsLabel}`);
}
const totalMeftah = Math.round(MEFTA_BAC_EXERCISES.reduce((s, ex) => s + pts(ex.pointsLabel), 0) * 100) / 100;
if (totalMeftah === 20) ok('Meftah : total copie = 20 ن');
else fail(`Meftah : total copie = ${totalMeftah} ≠ 20`);

// 2. Registre des attendus : 6 groupes, Σ items = maxPts (+ débordements SOURCÉS
// au corrigé, absorbés par le plafond maxPts), 100 % auto, énoncés présents.
// P2g : S2-Ex1 2025 — équation officielle 0.25×5 = 1.25 (Σ جزئيات = 5.5 > 5).
const DEPASSEMENTS: Record<string, number> = { '2-1': 0.5 };
const sujets: SujetId[] = [1, 2];
const exercices: ExerciceId[] = [1, 2, 3];
let totalRegistre = 0;
for (const s of sujets) {
  let totalSujet = 0;
  for (const e of exercices) {
    const g = attendusDeGroupe(s, e);
    totalSujet += g.maxPts;
    const somme = Math.round(g.items.reduce((a, i) => a + i.points, 0) * 100) / 100;
    const auto = plafondAutoDe(g);
    const depassement = DEPASSEMENTS[`${s}-${e}`] ?? 0;
    const toutAuto = g.items.every((i) => i.points <= 0 || i.formes.length > 0 || (i.composantes?.length ?? 0) > 0);
    if (somme !== g.maxPts + depassement) fail(`registre S${s}-Ex${e} : Σ items ${somme} ≠ maxPts ${g.maxPts} (+${depassement} sourcé)`);
    else if (auto !== somme) fail(`registre S${s}-Ex${e} : plafond auto ${auto} ≠ Σ ${somme} (item manuel résiduel)`);
    else if (!toutAuto) fail(`registre S${s}-Ex${e} : item à points sans formes ni composantes`);
    else if (g.questionAr.length < 20) fail(`registre S${s}-Ex${e} : énoncé absent`);
    else ok(depassement > 0
      ? `registre S${s}-Ex${e} : Σ = plafond auto = ${somme} (maxPts ${g.maxPts} + débordement sourcé ${depassement}) · énoncé présent`
      : `registre S${s}-Ex${e} : Σ = plafond auto = ${g.maxPts} · énoncé présent`);
  }
  if (totalSujet !== 20) fail(`registre S${s} : total ${totalSujet} ≠ 20`);
  totalRegistre += totalSujet;
}
if (totalRegistre === 40) ok('registre : 2 sujets × 20 = 40 ن');

// 3. Parité dictionnaire ↔ Meftah (M2) : S1-Ex1 ventilation officielle.
const g11 = ATTENDUS_BAC2025[1][1];
const q1 = Math.round(g11.items.filter((i) => i.id.includes('/Q1/')).reduce((s, i) => s + i.points, 0) * 100) / 100;
const q2 = Math.round(g11.items.filter((i) => i.id.includes('/Q2/')).reduce((s, i) => s + i.points, 0) * 100) / 100;
if (q1 === 1.25 && q2 === 3.75) ok('parité S1-Ex1 : Q1 = 1.25 · Q2 = 3.75 (corrigé officiel)');
else fail(`parité S1-Ex1 : Q1 = ${q1} · Q2 = ${q2} (attendu 1.25 / 3.75)`);

if (failures > 0) {
  console.error(`\n✗ ${failures} échec(s) — réaligner fiche/spec/carte sur docs/MARQUE.md`);
  process.exit(1);
}
console.log('\n✓ Garde-fou OK — marque, versions et assertions pédagogiques alignés');
