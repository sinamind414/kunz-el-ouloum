// scripts/check-miftah.ts
// Garde-fou MARQUE — prouve la cohérence fiche ↔ spec ↔ carte React ↔ vue compilateur.
// Référence : docs/MARQUE.md (document de décision). Exécution : npm run check:miftah
//
// Ce que le script protège :
//   §3 nom verrouillé      : « المفتاح » (usage) / « مفتاح المنهجية » (officiel),
//                            variantes latines et « مفتاح الكنز » bannies de l'UI
//   §4 règle de placement  : les deux noms jamais ensemble hors en-tête de la fiche
//   §10 bugs corrigés      : السنّ 0 → القفل, erreurs 1-3 sur le recto, garde-fou A4
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const html = read('public/miftah.html');
const card = read('src/components/MiftahCard.tsx');
const spec = read('src/data/miftahSpec.ts');
const compiler = read('src/components/MethodologyCompilerView.tsx');

// Découpe la fiche : recto = avant la balise de commentaire « الوجه الثاني »
const versoIdx = html.indexOf('الوجه الثاني');
if (versoIdx <= 0) {
  console.error('✗ impossible de découper le recto/verso de public/miftah.html');
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

console.log('\n§ Fiche — recto (public/miftah.html)');
must(recto, '<title>المفتاح · مفتاح المنهجية', 'title : usage + officiel');
must(recto, '<meta name="description" content="مفتاح المنهجية', 'meta description : officiel');
must(recto, '<h1>🔑 المفتاح</h1>', 'h1 : nom d’usage seul');
must(recto, '<div class="official">مفتاح المنهجية</div>', 'sous-titre discret : officiel');
must(recto, '<b>كنز العلوم</b>', 'marquage de la marque dans le header');
must(recto, 'مفتاح المنهجية · كنز العلوم · الوجه الأول', 'footer recto : officiel + marque');
must(recto, 'إجابة بلا رقم سؤال', 'erreur 1 sur le recto');
must(recto, 'رقم بلا وحدة', 'erreur 2 sur le recto');
must(recto, 'خاتمة غائبة', 'erreur 3 sur le recto');
mustNot(recto, 'شجرة نسب بحكم واحد', 'erreur 4 absente du recto');
mustNot(recto, 'السنّ 0', '« السنّ 0 » banni');
mustNot(recto, 'مفتاح الكنز', 'variante « مفتاح الكنز » bannie');
mustNot(html, 'MIFTAH', 'latin « MIFTAH » banni de la fiche');

console.log('\n§ Fiche — verso');
must(verso, '<b>كنز العلوم</b>', 'marquage de la marque dans le header');
must(verso, 'القفل — اِفهم', 'h3 : « القفل — اِفهم »');
must(verso, 'القفل · اِفهم', 'chaîne : nœud « القفل · اِفهم »');
must(verso, 'مفتاح المنهجية · كنز العلوم · الوجه الثاني', 'footer verso : officiel + marque');
must(verso, 'شجرة نسب بحكم واحد', 'erreur 4 sur le verso');
must(verso, 'دون «ومنه»', 'erreur 5 sur le verso');
must(verso, 'start="4"', 'numérotation continue (start=4)');
mustNot(verso, 'السنّ 0', '« السنّ 0 » banni');

console.log('\n§ Fiche — garde-fou A4 (le recto tient sur une page)');
must(html, '@page{size:A4', 'print : format A4');
must(html, 'page-break-before:always', 'verso : saut de page forcé');
must(html, 'font-size:10.4px', 'print : corps resserré (10.4 px)');
must(html, 'line-height:1.58', 'print : interlignage resserré');
must(html, 'width:168px;height:58px', 'print : SVG clé dimensionné pour l’A4');

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
must(verso, '12/12 على ثلاثة أيام مختلفة', 'fiche ك : 3 jours distincts');
must(verso, 'حامل المفتاح', 'fiche ك : badge liée au drill');
must(verso, 'تثبيت النواة على ثلاثة أنواع', 'fiche ك : verso débloqué à 3 types');
mustNot(html, 'ثلاث مرات متتالية', 'fiche : « متتالية » bannie');
must(card, '12/12 على ثلاثة أيام مختلفة', 'carte React : parité fiche ك');

console.log('\n§ Update 2026-09-06 (docs/MARQUE.md §12) — 3 portes + nouveaux noms des dents');
must(spec, "s1: 'تَبَصَّر'", 'spec : dent 1 = تَبَصَّر');
must(spec, "s2: 'أدخل'", 'spec : dent 2 = أدخل');
must(spec, "s3: 'أدر'", 'spec : dent 3 = أدر');
must(spec, "s4: 'افتح'", 'spec : dent 4 = افتح');
must(spec, 'KEY_MNEMONIC_AR', 'spec : phrase-mnémotechnique figée');
must(spec, 'bawaba1: \'البوابة ١ — الوجود (قفل أم لا؟)\'', 'spec : porte 1 = الوجود');
must(spec, 'bawaba3: \'البوابة ٣ — الحركة (📷 أم 🎬 أم 🔨؟)\'', 'spec : porte 3 = الحركة (3 issues)');
must(spec, "smith: { id: 'smith' as const, labelAr: '🔨 الحدّاد'", 'spec : mouvement 🔨 الحدّاد');
must(recto, '🔍 تَبَصَّر', 'fiche : dent 1 renommée');
must(recto, '🔓 افتح', 'fiche : dent 4 renommée');
must(recto, 'البوابة 1 — قفل أصلا؟', 'fiche : porte 1 = l\'existence');
must(recto, 'عائلتي قبل أن أكتب', 'fiche : ligne famille (reconnaissance, pas une décision)');
mustNot(recto, 'البوابة 3', 'fiche : 3e case de décision bannie (09-07)');
must(recto, 'أربع حركات، لا أكثر، وينفتح القفل', 'fiche : mnémonique');
must(recto, '🔨 الحدّاد', 'fiche : la 3e issue (angle mort corrigé)');
mustNot(recto, 'اِقْرَأْ', 'fiche : ancien nom 1 banni');
mustNot(recto, 'اِجْمَعْ', 'fiche : ancien nom 2 banni');
mustNot(recto, 'اِرْبِطْ', 'fiche : ancien nom 3 banni');
mustNot(recto, 'اِخْتِمْ', 'fiche : ancien nom 4 banni');
must(card, '🔍 تَبَصَّر', 'carte : parité dents avec la fiche');
must(card, '🔨 الحدّاد', 'carte : parité 3e issue');
mustNot(card, 'اِقْرَأْ', 'carte : anciens noms bannis');
must(compiler, 'البوابة ١ — قفل أصلا؟', 'vue : porte 1 = l\'existence');
must(compiler, 'البوابة ٣ — أي حركة يطلب هذا القفل؟', 'vue : porte 3 = le mouvement');
must(compiler, 'gate3Choice', 'vue : choix ternaire 📷/🎬/🔨 tracé');
mustNot(recto, 'البوابات الثلاث', 'fiche : titre « 3 portes » banni (09-07)');
must(recto, 'البوابتان + عائلتي', 'fiche : titre 2 portes + famille (09-07)');
mustNot(card, 'البوابات الثلاث', 'carte : titre « 3 portes » banni (09-07)');
must(card, 'عائلتي قبل أن أكتب', 'carte : ligne famille (parité fiche)');
must(compiler, '3 بوابات', 'vue : header 3 portes');
mustNot(compiler, '2 بوابتان', 'vue : « 2 بوابتان » banni');
console.log('\n§ Addendum 2026-09-07 (docs/MARQUE.md §12bis) — carte 2 portes + famille, noyau 11, dent 1 تَبَصَّر');
must(recto, '11 éléments', 'fiche : noyau = 11 (dégelé 10→11, explicite)');
must(card, '11 éléments', 'carte : noyau = 11 (parité fiche)');
must(verso, 'الحدّاد', 'fiche ك : حدّاد = 3e forme spéciale (verso)');
must(card, 'الحدّاد', 'carte : حدّad = 3e forme spéciale (parité verso)');
mustNot(recto, 'تعرّف', 'fiche : nom dent 1 (09-06) banni — collision عَرِّفْ');
mustNot(card, 'تعرّف', 'carte : nom dent 1 (09-06) banni — collision عَرِّفْ');
console.log('\n§ Addendum 2026-09-07 (docs/MARQUE.md §12ter) — annexe PRO (page 3, amritat, sur demande)');
must(spec, 'MIFTAH_ANNEXE_AR', 'spec : constante nom annexe');
must(spec, 'ANNEXE = {', 'spec : contenu annexe centralisé');
must(spec, 'FOOTER_ANNEXE_AR', 'spec : footer annexe');
must(spec, "ruleAr: 'لا أبحث عن جواب فقط", 'spec : règle d’or annexe');
must(verso, 'المفتاح PRO', 'fiche : annexe présente (page 3)');
must(verso, 'لا أبحث عن جواب فقط', 'fiche : règle d’or (parité spec)');
must(verso, 'قاعدة حمراء', 'fiche : règle rouge causalité (ذ)');
must(verso, 'المتغيّر المُختبَر', 'fiche : 4 questions expérience (ر)');
must(verso, 'نقترح أن', 'fiche : template hypothèse (س)');
must(verso, 'عند الطلب', 'fiche : distribution sur demande');
must(recto, 'الوجه الأول — المفتاح (11 عنصرًا)', 'fiche : footer recto réparé 10→11');
must(verso, '≈ 21', 'fiche : niveau amritat ≈ 21 (annexe)');
must(card, '{ANNEXE.ruleAr}', 'carte : règle d’or rendue depuis la spec');
must(card, '{ANNEXE.causalAr}', 'carte : règle rouge rendue depuis la spec');
must(card, 'FOOTER_ANNEXE_AR', 'carte : footer annexe depuis la spec');
mustNot(verso, 'علوم الطبيعة والحياة', 'fiche : nom de série ≠ matière banni (régression doc PRO)');
mustNot(card, 'علوم الطبيعة والحياة', 'carte : nom de série ≠ matière banni');
must(spec, "hamad: {", 'spec : SPECIAL_FORMS + الحدّاد (parité verso)');
must(spec, "countAr: '≈ 21'", 'spec : LEVELS amritat ≈ 21 (parité fiche)');
console.log('\n§ v3.3 (docs/MARQUE.md §12quater) — collision close + import V4.1 au niveau contenu');
must(spec, "MIFTAH_VERSION = '3.3'", 'spec : version 3.3');
must(spec, 'TOOTH3_ROUTE_AR', 'spec : route dent 3');
must(spec, 'GOLDEN_FORMULA_AR', 'spec : formule dorée');
must(verso, 'معطى ← مقارنة ← علاقة ← تفسير', 'fiche verso : route dent 3 (ز)');
must(verso, 'تُظهر الوثيقة …، وبمقارنة', 'fiche verso : formule dorée (ز)');
must(card, '{GOLDEN_FORMULA_AR}', 'carte : formule dorée depuis la spec');
must(card, '{TOOTH3_ROUTE_AR}', 'carte : route dent 3 depuis la spec');
must(verso, '3</b> = <b>المعالجة</b>', 'fiche verso : حدّad en 3 phases (données/montage/produit)');
must(card, '3</b> = <b>المعالجة</b>', 'carte : حدّad 3 phases (parité fiche)');
must(spec, '3 = المعالجة', 'spec : SPECIAL_FORMS.hamad 3 phases');
mustNot(html, 'V4.1', 'fiche : « V4.1 » banni (version fork non adoptée)');
mustNot(card, 'V4.1', 'carte : « V4.1 » banni');

if (failures > 0) {
  console.error(`\n✗ ${failures} échec(s) — réaligner fiche/spec/carte sur docs/MARQUE.md`);
  process.exit(1);
}
console.log('\n✓ Garde-fou MARQUE OK — fiche, spec, carte et vue compilateur alignés');
