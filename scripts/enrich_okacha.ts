// enrich_okacha.ts — 2ᵉ passe OCR + structuration du « بنك الحفظ » (audit 2026-09-22).
//
// ENTRÉE : src/data/okacha.ts (injection mécanique v1 verbatim — NE PAS ÉDITER).
// SORTIE : src/data/okachaEnriched.ts (GÉNÉRÉ — NE PAS ÉDITER À LA MAIN).
//
// Transformations (toutes tracées dans ENRICH_STATS / ENRICH_FIXES) :
//  1. Parsing en blocs sémantiques : titre | point (numéroté) | puce | note | texte ;
//  2. Recollage des fragments OCR (< 25 car.) et des lignes de continuation
//     (précédent sans ponctuation finale) — le texte reste contiguous ;
//  3. Normalisation de la numérotation (« 6-\t » → « 6- », « 14 ٠ » → « 14- »,
//     « 3 1 - » → « 31- ») — AUCUNE renumérotation, seul le séparateur est nettoyé ;
//  4. Corrections OCR à haute confiance (dictionnaire ci-dessous) — zéro invention :
//     un mot non réparable reste verbatim ;
//  5. Méthodo : découpage en sections par déclencheurs documentés ;
//     9ᵉ section « nasiha » = OKACHA_CONSEILS (ex-d2u2, isolée 2026-09-23) ;
//     tamarin1 : sous-sections à ids stables (t1-def/don/inter/dessin/texte) ;
//     filtre OCR anti-résidu (footer éditeur, marqueurs page, fragments cassés)
//     sur sections + conseils — SANS réécriture du sens (retrait seul) ;
//  6. Nettoyage post-fixes : un retrait (famille B) peut vider un bloc ou le
//     réduire sous 20 car. APRÈS les passes de structurize → on retire les
//     blocs vides (aucun sens inventé — la ligne source reste couverte côté
//     verrou via ENRICH_FIXES) et on recolle les restes courts au précédent.
//
// Verrou : src/data/okachaEnriched.lock.test.ts (v2).

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { OKACHA_UNITES, OKACHA_METHODO, OKACHA_CONSEILS } from '../src/data/okacha';
import { assainirTexte, estDechetOCR } from '../src/data/okachaQuality';

// ── Dictionnaire de corrections OCR (haute confiance uniquement) ──
// v2 (2026-09-24, audit « arabe 100 % » de la rubrique الحصيلة المعرفية) :
//   · famille A : réparations فصحى certaines (darija « بصح » retirée, mots OCR
//     attestés : العرض / حيث / الطالب / التمرين / الأسئلة / وثائق…) ;
//   · famille B : retraits de résidus 100 % illisibles (valeur to vide) —
//     aucun sens inventé, on retire ce qui ne peut pas être lu.
const FIXES: Record<string, string> = {
  // ── A. Réparations certaines (les plus longues d’abord : non-recouvrement) ──
  // Audit الحصيلة المعرفية (2026-09-24) : fautes OCR attestées à l’écran.
  'الغلكوكوكيناز': 'الغليكوكيناز', // استتاج الخاص — l.1603
  'المستتجة': 'المستنتجة', // ربط المستنجة — l.1701
  'استتاج': 'استنتاج', // الاستتاج(ات) / باستتاج — ت↔ن OCR
  'انجاه': 'اتجاه', // اتجاه الموجة / الحقل / مادة التفاعل
  'انتفال': 'انتقال', // انتقال الموجة الزلزالية — l.822
  'لاكا بصح بالابتعاد عن كل وسائل التشويش (هاتف، موسيقى، تلفاز...) ولدراسة في غفة جبد: ءة وهادئة، بالإضافة إلى':
    'لكن لا بدّ من الابتعاد عن كل وسائل التشويش (الهاتف، الموسيقى، التلفاز...)، وأن تجري الدراسة في غرفة نظيفة هادئة، مع',
  '،:وي النمرين الثاني على جزأين منتابعبن ومنكاملبن من': 'ويتضمّن التمرين الثاني جزأين متتابعين ومتكاملين من',
  '،انيا ما بحنوي النمرين الثاني على:': 'أمّا ما يحتوي عليه التمرين الثاني فهو:',
  'نرظبف الموارد المعرفية والمنهجية في مارسة الاسنادلال المامي.': 'نوظِّف الموارد المعرفية والمنهجية في ممارسة الاستدلال العلمي.',
  'ماشرة ونمر-لعمر مطلوب': 'مباشرةً ونمرّر للعنوان المطلوب',
  'آلة عمل لاريم إما تكبها': 'آلية عمل الإنزيم إمّا تكتبها',
  'تفنع عأيهد فسلن لس مهاود سر ته دفيديبافايد اد اعزما بمن الاعتبار:':
    'ينبغي أن نأخذ في الحسبان:',
  'أنناء الإجابة عن كل موضوع يوجد معلومات رنبسبة (.ركرية) و.ملممات تانري: (مطن)':
    'أنّ في الإجابة عن كل موضوع معلومات رئيسية ومعلومات ثانوية',
  'يركر الطالب على المعلومات الرلبسية': 'يُركّز الطالب على المعلومات الرئيسية',
  'يادللإجانة على السوال': 'عند الإجابة عن السؤال',
  'حبث يخير اطالب': 'حيث يختار الطالب',
  'ويحبذلوتكون الإجابة': 'ويُحبَّذ لو تكون الإجابة',
  'تسهيل همة المصحح': 'تسهيل مهمة المصحح',
  'الممنومات لنربا الإمام والغموض': 'المعلومات لرفع الإبهام والغموض',
  'مفدمة خاصة بكل جزء': 'مقدمة خاصة بكل جزء',
  'عنوان النحلبل': 'عنوان التحليل',
  'الحلالب أن محس. استغلالها': 'الطالب أن يُحسِن استغلالها',
  'بتلربفة الحصول عليها': 'بطريقة الحصول عليها',
  'لبي شكل عنوان': 'في شكل عنوان',
  'اللمران المناني:': 'التمرين الثاني:',
  'الورض:': 'العرض:',
  'مجموعة طمات': 'مجموعة كلمات',
  'الأعضاء المناعبة الهيطية': 'الأعضاء المناعية اللمفاوية',
  'بدائيات النواة': 'أوليات النواة',
  'النمرين': 'التمرين',
  'الأستلة': 'الأسئلة',
  'الأسلة': 'الأسئلة',
  'السوال': 'السؤال',
  'الجزيات': 'الجزئيات',
  'استنباطين': 'استنباطية',
  'ونائف': 'وثائق',
  'المنعلف: بها': 'المتعلقة بها',
  'وإذاكان': 'وإذا كان',
  'إذاكانت': 'إذا كانت',
  'إذاكان': 'إذا كان',
  'إذاكتبت': 'إذا كتبت',
  'دكرت سافا': 'ذكرت سالفاً',
  // ── B. Retraits de résidus illisibles (aucune réécriture) ──
  'فاتارز': '', // fin de « . نقوم بس … نادفلد\tفاتارز » (méthodo l.1669) — 100 % illisible
  'غاد منه املية علي اللفة لورية بن ال»اع٨ و د٩ا٩«مع امتالال الألميث لي لا5"أيأ': '',
  'يفايي فاد اطمي في ود فنففأ، ٥ اشه ١ي٤عب٢ دبئ ودش': '',
  'ب-شو ثالع نجية: و هذه الالذ بمدا قمتا شحليل للمطيات افحيية والقطما الفحرن ت٢٢،': '',
  'فلي ميازفي انحاب تحرية شاهدة أي نكودفيه التبحة طيمية، واقي التجاي فم ٠٠': '',
  'مرة ي كف فدد ايحداد أش فيفافيأتلبنت دطد ود فد ': '',
  'ءماش، الملالس الممو لك': '',
  'يحسن تغ و على': '',
  'مشروع ءكاشة للطالس المنفوفى المفوف في ءلوم العليم.': '',
  'الصاغة الدقيقة للمخكر لملمك وحصره جيدا٠ ا': '',
  'الصاغة الدقيقة للمخكر لملمك وحصره جيدا٠\tا': '',
  'نقوم بس سبدبدتديتفي«نادفلد': '',
  'المصدرية ..الخ)': '',
  '"أمثي" يكرف ساف وففو في، أ، ٨صد دب د"٩، فى شكل«آ»( أدينوزين ثلاثي الفوسفات).': '',
  'مت مد إم ف يدر د الة فنخ مداع اني ي فا ة': '',
  'بربشفي^سأةم :': '',
  'الالياسدسماي كد ا بي١٨٠٨دششت اد بصورة أدف.': '',
  'باندثاعن مستويات الينية الفراغية ني العرض، نقول في الخاتمة أن النية الفراغية محددة ورايا وأي طفرة ض ,-^,,؛٠٠٠:-٠٠٠-^—, ;د بلا٠': '',
  "لأحأض'لأ^في'^٠ اصاد ي ك": '',
  'يل امم تف كصرس اسب المامة 2٢ ياط فهاماالاكايا أسحت ٢ الكا ير': '',
  'وا لتدن عدانهارب فعية، نتك رقب نر من كل نهبة(عوااإن أحد) نم غمللكل ت2 مله': '',
  'تحدر مدف م شد « شطأ أتا سي -١٢ ٥٢ قطب ٨٩٢ ٤': '',
  'ادب سه قبل ٦2 يوما، ينما يد دام سريعا في - مد اس في س': '',
  '٠ ٥٤٨ الجدول نغبرات عا.د الركائز المعولة بادلالة نهبرات درجة الممارة، و المالة ف.. ،ا ١١٠ : بغه " " أ': '',
  'تد التالة: لماذا، كيف، انساخ مس مب ادمكة :': '',
  '- ه يوتسم ح -ف 5 ١٠، لر:': '',
  'يمد مع افد الي اميياك الكن من صحة م ) الخروج بمعلون .': '',
  'لمه النسل في هو يعود ل، يرجع ال، يتسبب ب، يفر ر٠ لأن...':
    'يعود إلى، يرجع إلى، يتسبب في، يُفسَّر بـ ...',
  'با تكتب في نقاط وجيزة، أي ما فل': 'بل تُكتب في نقاط وجيزة.',
  '- La هي المراجمة الغير فعالة؟': '- ما هي المراجعة غير الفعّالة؟',
  "1 ' اشحاج العلومات من الرسم التخطيطي:": 'استخراج المعلومات من الرسم التخطيطي:',
  // ── Historique v1 (audit 2026-09-22) ──
  'الرونبنات': 'البروتينات', // permutation boustrophedon attestée (U1)
  'الأمنية': 'الأمينية', // أحماض أمينية (U1)
  'براوبط': 'بروابط', // روابط boustrophedon (U1)
  'النيكلبوتيدة': 'النيكليوتيدة', // (U1)
  'النيكلبوتيدات': 'النيكليوتيدات',
  // ── Lot C (2026-09-24) : corrections ciblées SVT — haute confiance, zéro invention ──
  'سلسة ببتيدية': 'سلسلة ببتيدية', // U1 : peptide chain
  'سلسة البيبتيدية': 'سلسلة البيبتيدية',
  'أحماض أمنية': 'أحماض أمينية', // U1 : amino acids
  'الأحماض الأمنية': 'الأحماض الأمينية',
  'إلى صفن': 'إلى صنف', // U1 : « تقس القواعد الآزوتية إلى صفن » → صنف (contexte fermé)
  'باليوراسبل': 'باليوراسيل', // U1 : uracil
  'اليوراسبل': 'اليوراسيل',
  'استرفوسفاتية': 'فوسفاتية', // U1 : phosphodiester linkage
  'ا لكلونيد': 'النيكليوتيد', // U1 : nucleotide (unité de base ADN)
  'الكوموسومات': 'الكروموسومات', // U1 : chromosomes
  'اللاهو الدعامة': 'اللاهوائي الدعامة', // U1 : nuclear matrix context
  'نبفبة النواة': 'أغشية النواة', // U1 : nuclear envelope (eucaryote)
};

// ── Normalisation arabe (même logique que okacha.lock.test.ts) ──
export const normAr = (s: string): string =>
  s
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[إأآٱا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');

type BlocKind = 'titre' | 'point' | 'puce' | 'note' | 'texte';
interface Bloc {
  kind: BlocKind;
  num?: string;
  texte: string;
}

const TERMINAL = /[.!؟:]$/;

// Détection d'un point numéroté (chiffres latins OU arabes-indiques, ou lettre-ordinal)
// NB : « ٠ » n'est PAS un séparateur ici — il est géré comme puce (branche num==='٠').
const RE_POINT =
  /^\s*((?:\d{1,2}|[٠-٩]{1,2})\s*(?:[-–٫.\t''ʼ])\s*|[٠-٩]\s+(?=\S)|[أ-ي]\s*-\s*)/;
const RE_POINT_DIRTY = /^\s*(\d{1,2})\s+([٠ا]|ا)\s*[-–٫.]?\s*/; // « 14 ٠ » / « 1 ا »
const RE_POINT_SPLIT = /^\s*(\d)\s+(\d)\s*[-–٫.]\s*/; // « 3 1 - » → « 31- »
const RE_PUCE = /^\s*(?:[٠•*\u2022]|-\s|\u2013\s|\.)/;

function parseBlocRaw(raw: string): Bloc {
  const t = raw.replace(/\s+/g, ' ').trim();
  if (/^الوحدة/.test(t)) return { kind: 'titre', texte: t };
  let m = RE_POINT_SPLIT.exec(t);
  if (m) return { kind: 'point', num: `${m[1]}${m[2]}`, texte: `${m[1]}${m[2]}- ${t.slice(m[0].length)}` };
  m = RE_POINT_DIRTY.exec(t);
  if (m) return { kind: 'point', num: m[1], texte: `${m[1]}- ${t.slice(m[0].length)}` };
  m = RE_POINT.exec(t);
  if (m) {
    // NB : « ٠ » N'EST PAS dans la classe de strip — c'est un chiffre, pas un séparateur.
    let num = m[1].trim().replace(/[-–٫.\t\s''ʼ]+$/g, '');
    if (!num) num = '٠';
    // « ٠ » seul en tête = puce OCR, pas un point numéroté 0 (tiret inclus).
    if (num === '٠') {
      return { kind: 'puce', texte: t.replace(/^\s*٠\s*[-–٫.]?\s*/, '') };
    }
    // Gargouilles OCR d'apostrophe entre le numéro et le tiret (« 3'?- ») :
    // le marqueur a mangé « ' », le « ? » et le « - » résiduels partent aussi.
    const reste = t.slice(m[0].length).replace(/^\s*[?'؟][-–٫.\s]*/, '');
    return { kind: 'point', num, texte: `${num}- ${reste}` };
  }
  if (/^ملاحظة/.test(t)) return { kind: 'note', texte: t };
  if (RE_PUCE.test(t)) {
    const texte = t
      .replace(/^\s*[٠•*\u2022]\s*/, '')
      .replace(/^\s*[-–]\s*/, '')
      .replace(/^\s*\.\s*/, '');
    // Une puce qui n'est qu'un intitulé court se terminant par « : » = sous-titre.
    if (texte.endsWith(':') && texte.length < 40) return { kind: 'titre', texte };
    return { kind: 'puce', texte };
  }
  if (t.endsWith(':') && t.length < 90) return { kind: 'titre', texte: t };
  return { kind: 'texte', texte: t };
}

/** Même critère que les passes A/C et le verrou : un sous-titre court (< 20 car.)
 *  finissant par « : » est un TITRE — « ملاحظة: », « 1- التحليل: »… ne sont pas
 *  des fragments orphelins. Appliqué APRÈS les branches point/note/puce (qui
 *  interceptent ces lignes avant la règle titre générique). */
function parseBloc(raw: string): Bloc {
  const b = parseBlocRaw(raw);
  if (b.kind !== 'titre' && b.texte.trim().endsWith(':') && b.texte.trim().length < 20) {
    b.kind = 'titre';
  }
  return b;
}

/** Applique les 3 passes de recollage + normalisation sur une liste de lignes brutes. */
function structurize(lignes: string[]): { blocs: Bloc[]; fragments: number; rattrapages: number; numeros: number } {
  const blocs = lignes.map(parseBloc).filter((b) => b.texte.length > 0);
  let fragments = 0;
  let rattrapages = 0;
  let numeros = 0;

  // Pass A — fragments courts (< 25 car.) : recollés au précédent (ou au suivant).
  // Protection : les blocs « titre de section » (court et se terminant par « : »)
  // ne sont JAMAIS recollés — ils servent de déclencheurs (méthodo) et d'ancres.
  const isHeadingLike = (b: Bloc) => b.texte.trim().endsWith(':') && b.texte.trim().length < 40;
  for (let i = 0; i < blocs.length; ) {
    const b = blocs[i];
    if (b.kind !== 'titre' && !isHeadingLike(b) && b.texte.trim().length < 25) {
      if (i > 0) {
        blocs[i - 1].texte += ` ${b.texte}`;
        blocs.splice(i, 1);
      } else if (blocs.length > 1) {
        blocs[i + 1].texte = `${b.texte} ${blocs[i + 1].texte}`;
        blocs.splice(i, 1);
      } else break;
      fragments++;
    } else i++;
  }

  // Pass B — continuations : uniquement vers une ligne « texte » (jamais vers une
  // puce/point — deux puces sans point final restent deux puces distinctes).
  for (let i = 0; i < blocs.length - 1; ) {
    const b = blocs[i];
    const next = blocs[i + 1];
    if (
      next.kind === 'texte' &&
      (b.kind === 'texte' || b.kind === 'puce') &&
      !TERMINAL.test(b.texte.trim())
    ) {
      b.texte += ` ${next.texte}`;
      blocs.splice(i + 1, 1);
      rattrapages++;
    } else i++;
  }

  // Pass C — sécurité : plus aucun non-titre < 20 car. (titres protégés).
  for (let i = 0; i < blocs.length; ) {
    const b = blocs[i];
    if (b.kind !== 'titre' && !isHeadingLike(b) && b.texte.trim().length < 20) {
      if (i > 0) {
        blocs[i - 1].texte += ` ${b.texte}`;
        blocs.splice(i, 1);
      } else if (blocs.length > 1) {
        blocs[i + 1].texte = `${b.texte} ${blocs[i + 1].texte}`;
        blocs.splice(i, 1);
      } else break;
      fragments++;
    } else i++;
  }

  // Normalisation de la numérotation (aucune renumérotation — séparateurs seulement).
  for (const b of blocs) {
    if (b.kind === 'point' && /\t/.test(b.texte)) {
      b.texte = b.texte.replace(/\t+/g, ' ').replace(/\s{2,}/g, ' ');
      numeros++;
    }
  }
  return { blocs, fragments, rattrapages, numeros };
}


// ── Filtre OCR anti-résidu (retrait seul — zéro réécriture du sens) ──
// Appliqué aux sections méthodo + conseils. Motifs documentés (audit 2026-09-23).
const RE_FOOTER_EDITEUR = /[,،;]?\s*(مكاداللطالس المنهول|كاداللطالس المنهول|كاشة لإطالس المنهوق[^.،\n]*|كاشة لاطالب المنفوق[^.،\n]*|ماشة الطالس المنهوق[^.،\n]*|لطالس المنهوق|لطالس المنه|,?\s*مكاداللطالس المنهول)\s*$/u;
const RE_FOOTER_MID = /[,،]\s*(مكاداللطالس المنهول|كاداللطالس المنهول)\b/u;
const RE_PAGE_MARK = /^\s*(?:صفحة\s*)?\d{1,4}\s*[٪%]?\s*$/u;
const RE_PURE_JUNK = /^\s*[\d\s%.\-–—٠-٩]+\s*$/u;
/** Fragments entièrement illisibles attestés (liste fermée — retraits documentés).
 *  NB : jamais de classe \W générique — l'arabe n'est PAS \w en JS, un motif
 *  large supprimerait tout le corpus. On ne retire QUE des signatures connues. */
const JUNK_EXACT = new Set([
  'ابونان\t٠ف٤ش٠٠ا١كد',
  'زعبف مهما',
  'ف مفات مرب',
  'م العلوم الطبيعية.',
  '،٠٠',
  'القسم ؟',
]);
const JUNK_INCLUDES = [
  'زعبف مهما',
  'طتتلاعفيه قالبا لتجنب النكات',
  'ييياييبيطات يميماخم',
  'فعاياكاي الابية',
  'موقمين نحفبزين',
  'اا40من ارتباط',
  'Blot اا0 ا٤',
  'ماشة الطالس المنهوق',
  'كاشة لإطالس المنهوق',
  'كاشة لاطالب المنفوق',
  'تديييدييتديييدييي',
  'خثئكلكتلاتتكبيككادافاة',
  'عوف تتعاعل مع القادة',
  'يعكائ للطاف سول حيفيعم',
  'لابهم حجم المرض بقدر',
  'توترة إل باه الص العلمي',
  'لنت كابنة رقور أقلام',
  'اشلنكمات الفتاحية العلمية',
  'باكاد اليان الاحن',
  'إق (رس بعوان',
  'أعلب السومات النخطبطية',
  'لابيي»ال64ال',
  'نئ^ عدت على مستوى',
  'المنهوف ا عاوم العطبمة',
  '،-إنماز رسم تهطيطي',
  'و ددابة لبا أن',
];
function estJunk(t: string): boolean {
  const s = t.trim();
  if (JUNK_EXACT.has(s)) return true;
  return JUNK_INCLUDES.some((x) => s.includes(x));
}

function filtreOcrBlocs(blocs: { kind: string; num?: string; texte: string }[]): number {
  let retraits = 0;
  for (let i = blocs.length - 1; i >= 0; i--) {
    let t = blocs[i].texte;
    // 9070 → 90 % (OCR attesté : « يوفر لك 9070 من الزاد » → 90 %)
    if (t.includes('9070')) { t = t.split('9070').join('90 %'); retraits++; }
    // footer éditeur (fin ou milieu)
    const av = t;
    t = t.replace(RE_FOOTER_MID, '').replace(RE_FOOTER_EDITEUR, '').trim();
    // queue de chiffres type n° page / téléphone OCR (ex. « … الفيتامين سي. ٦٤٥٦٢٦١٨ »)
    t = t.replace(/[.،؛]\s*[\d٠-٩\s]{6,}$/u, '').trim();
    if (t !== av) retraits++;
    // marqueurs de page purs
    if (RE_PAGE_MARK.test(t) || (blocs[i].kind !== 'titre' && RE_PURE_JUNK.test(t) && t.length < 12)) {
      blocs.splice(i, 1); retraits++; continue;
    }
    // bloc entier illisible (liste fermée documentée)
    if (blocs[i].kind !== 'titre' && estJunk(t)) { blocs.splice(i, 1); retraits++; continue; }
    // vide après filtre → retirer (sauf titre conservé tel quel)
    if (!t && blocs[i].kind !== 'titre') { blocs.splice(i, 1); retraits++; continue; }
    blocs[i] = { ...blocs[i], texte: t };
  }
  return retraits;
}

// ── Sections méthodo : dans L'ORDRE DU LIVRE. Déclencheurs testés sur le texte
// NORMALISÉ (normAr : ة→ه, أ→ا, ى→ي) — motifs écrits en forme normalisée :
// « 1- التحليل: » (l.205), « 2-التفهلسوير: » (l.289, OCR de التفسير),
// « 3- المقارنة: » → « 3- المقارنه: », « ٠. اللالملقفقاة: » (l.339, OCR de
// الاستنتاج), « 9-الاستدلال العلمي: » (l.437) — sondage scripts/_probe_okacha.ts.
const SECTION_RULES: { id: string; titreAr: string; test: (t: string) => boolean }[] = [
  {
    id: 'intro',
    titreAr: 'مقدمة المنهجية — قواعد العمل',
    test: () => false, // section par défaut (tout ce qui précède le 1ᵉʳ déclencheur)
  },
  {
    id: 'hikala',
    titreAr: 'هيكلة الموضوع — التمهيد، الوثائق، التعليمة',
    test: (t) => t.includes('الهيكله العامه') || t.startsWith('التمهيد'),
  },
  {
    id: 'tamarin1',
    titreAr: 'التمرين الأول — أسئلة استرداد الموارد',
    test: (t) =>
      t.length < 60 &&
      /النمريف الامل|التمرين الاول|النمرين الاول|ارز ما يطرح/.test(t),
  },
  {
    id: 'tahil',
    titreAr: 'التحليل — استغلال الوثيقة',
    test: (t) => t.length < 45 && /^1\s*[''ʼ٠]?\s*[-–٫.]?\s*التحليل|^التحليل:/.test(t),
  },
  {
    id: 'tafsir',
    titreAr: 'التفسير — من الملاحظة إلى العلّة',
    // Variantes OCR attestées : « 2-التفهلسير: » (l.289) et « التفسير ».
    test: (t) => t.length < 45 && /^2\s*[-–٫.]?\s*التف\S{0,5}ير/.test(t),
  },
  {
    id: 'mouqarana',
    titreAr: 'المقارنة — أوجه التشابه والاختلاف',
    test: (t) => t.length < 45 && /^3\s*[-–٫.]?\s*المقارنه/.test(t),
  },
  {
    id: 'istinj',
    titreAr: 'الاستنتاج — خاص وعام',
    test: (t) => {
      const core = t.replace(/^[\s٠.٫\-–]+/, '');
      return (
        /^٠\s*[.٫]?\s*(اللالملقفقاه|الاستنتاج)/.test(t) ||
        (core.length < 45 && /الاستنتاج|الاستتاج|اللالملقفقاه/.test(core))
      );
    },
  },
  {
    id: 'istidlal',
    titreAr: 'الاستدلال العلمي ومعاييره',
    test: (t) => t.length < 50 && /الاستدلال العلمي|الاست»دلال/.test(t),
  },
];

function sectionsMethodo(lignes: string[]): {
  sections: { id: string; titreAr: string; blocs: Bloc[]; sous?: { id: string; titreAr: string; from: number }[] }[];
  corrections: number;
  fragments: number;
  rattrapages: number;
  numeros: number;
  ocr: number;
  retires: number;
  dechets: number;
} {
  // Lot B : déchets en ligne brute AVANT recollage (ne pas fusionner propre+sale).
  const pre = filtrerLignesDechet(lignes);
  let dechets = pre.n;
  const { blocs, fragments, rattrapages, numeros } = structurize(pre.lignes);
  const corrections = applyFixes(blocs);
  // Propreté post-fixes AVANT découpage (blocs vidés inertes + restes < 20 car.).
  let retires = nettoieBlocs(blocs);
  const sections: { id: string; titreAr: string; blocs: Bloc[]; sous?: { id: string; titreAr: string; from: number }[] }[] = [];
  let current: { id: string; titreAr: string; blocs: Bloc[]; sous?: { id: string; titreAr: string; from: number }[] } = { id: 'intro', titreAr: SECTION_RULES[0].titreAr, blocs: [] as Bloc[] };
  sections.push(current);
  // Pointeur : chaque déclencheur n'est testé que dans l'ordre du livre —
  // une mention tardive d'un thème déjà traité ne rouvre jamais sa section.
  let nextRule = 1;
  for (const b of blocs) {
    const t = normAr(b.texte);
    if (nextRule < SECTION_RULES.length && SECTION_RULES[nextRule].test(t)) {
      current = { id: SECTION_RULES[nextRule].id, titreAr: SECTION_RULES[nextRule].titreAr, blocs: [b] };
      sections.push(current);
      nextRule++;
    } else {
      current.blocs.push(b);
    }
  }
  // Fusion des sections trop petites (< 3 blocs) dans la précédente — jamais de section vide.
  for (let i = 1; i < sections.length; ) {
    if (sections[i].blocs.length < 3) {
      sections[i - 1].blocs.push(...sections[i].blocs);
      sections.splice(i, 1);
    } else i++;
  }
  // Filtre OCR anti-résidu sur chaque section (retrait seul) + re-nettoyage
  // (le filtre peut vider un bloc ou laisser un titre vide).
  let ocr = 0;
  for (const s of sections) {
    ocr += filtreOcrBlocs(s.blocs);
    retires += nettoieBlocs(s.blocs);
  }
  // Lot B : filet post-fixes sur les blocs (déchets restants) AVANT re-fusion + ancrages sous.
  for (const s of sections) dechets += filtreDechetOCR(s.blocs);
  // Re-fusion post-filtre si une section a été vidée sous le seuil.
  for (let i = 1; i < sections.length; ) {
    if (sections[i].blocs.length < 3) {
      sections[i - 1].blocs.push(...sections[i].blocs);
      sections.splice(i, 1);
    } else i++;
  }
  // Sous-sections à ids stables dans tamarin1 (découpage logique — ancrage par contenu).
  const t1 = sections.find((s) => s.id === 'tamarin1');
  if (t1) {
    const sousDefs: { id: string; titreAr: string; ancre: (t: string) => boolean }[] = [
      { id: 't1-def', titreAr: 'التعريف والكلمات المفتاحية', ancre: (t) => /التعريف:|الكلمه المفتاحيه|الكلمة المفتاحية/.test(t) },
      { id: 't1-don', titreAr: 'البيانات واستخراج المعطيات', ancre: (t) => /اشحاج العلومات|استخراج العناصر|العلومات من الرسم/.test(t) },
      { id: 't1-inter', titreAr: 'استغلال الوثيقة والتفسير الموجز', ancre: (t) => /اذاكان الرسم يوضح وظيفه|اذاكان الرسم يوضح بنيه/.test(t) },
      { id: 't1-dessin', titreAr: 'الرسم التخطيطي — الرسم والبيانات', ancre: (t) => /انواع الرسومات التخطيطيه|رسم تخطيطي تفسيري/.test(t) },
      { id: 't1-texte', titreAr: 'كتابة النص العلمي', ancre: (t) => /كابه نص علمي|كتابه نص علمي|النص العلمي يشبه/.test(t) },
    ];
    const idxs: number[] = [];
    for (const d of sousDefs) {
      const i = t1.blocs.findIndex((b, gi) => idxs.every((x) => gi > x) && d.ancre(normAr(b.texte)));
      if (i >= 0 && (idxs.length === 0 || i > idxs[idxs.length - 1])) idxs.push(i);
      else idxs.push(-1); // ancre absente — on n'insère pas de faux repère
    }
    const starts: { id: string; titreAr: string; from: number }[] = [{ id: 't1-entree', titreAr: 'مقدمة التمرين وأساليب الأسئلة', from: 0 }];
    for (let k = 0; k < sousDefs.length; k++) {
      if (idxs[k] >= 0) starts.push({ id: sousDefs[k].id, titreAr: sousDefs[k].titreAr, from: idxs[k] });
    }
    t1.sous = starts;
  }
  return { sections, corrections, fragments, rattrapages, numeros, ocr, retires, dechets };
}
function applyFixes(blocs: Bloc[]): number {
  let n = 0;
  for (const b of blocs) {
    for (const [from, to] of Object.entries(FIXES)) {
      while (b.texte.includes(from)) {
        b.texte = b.texte.replace(from, to);
        n++;
      }
    }
  }
  return n;
}

/** Propreté POST-fixes (étape 6 du header) : un retrait (famille B) peut vider
 *  un bloc ou le réduire sous 20 car. APRÈS les passes de structurize.
 *   1. trim + retrait des blocs vides (tous kinds — un titre vide ne sert à rien) ;
 *      la ligne source reste couverte côté verrou (avecFixes → '' → toujours inclus) ;
 *   2. promotion « titre » des restes < 20 finissant par « : » (miroir parseBloc) ;
 *   3. recollage des restes courts non-titre vers le précédent (règle Pass C).
 *  Idempotent — appelé après applyFixes (unités, méthodo) et après filtreOcr
 *  (sections, conseils). Renvoie le nombre de blocs retirés. */
function nettoieBlocs(blocs: Bloc[]): number {
  let retires = 0;
  for (const b of blocs) b.texte = b.texte.trim();
  for (let i = blocs.length - 1; i >= 0; i--) {
    if (blocs[i].texte.length === 0) {
      blocs.splice(i, 1);
      retires++;
    }
  }
  for (const b of blocs) {
    if (b.kind !== 'titre' && b.texte.endsWith(':') && b.texte.length < 20) b.kind = 'titre';
  }
  for (let i = 0; i < blocs.length; ) {
    const b = blocs[i];
    if (b.kind !== 'titre' && b.texte.length < 20) {
      if (i > 0) {
        blocs[i - 1].texte += ` ${b.texte}`;
        blocs.splice(i, 1);
      } else if (blocs.length > 1) {
        blocs[i + 1].texte = `${b.texte} ${blocs[i + 1].texte}`;
        blocs.splice(i, 1);
      } else break;
      retires++;
    } else i++;
  }
  return retires;
}

/** Lot B (pré-structurize) : retire les lignes brutes qui SONT des déchets
 *  (score ≥ seuil) AVANT recollage — évite d'avaler une ligne propre fusionnée
 *  à un déchet. Assainit ■ sur les lignes conservées. */
function filtrerLignesDechet(lignes: string[]): { lignes: string[]; n: number } {
  const out: string[] = [];
  let n = 0;
  for (const l of lignes) {
    if (estDechetOCR(l)) {
      n++;
      continue;
    }
    out.push(assainirTexte(l));
  }
  return { lignes: out, n };
}

/** Lot B (post-fixes) : retrait des déchets scan restants (score ≥ seuil)
 *  + assainissement des blocs conservés (retrait ■).
 *  N'épile JAMAIS une erreur de lettres lisible (lot C s'en charge via FIXES). */
function filtreDechetOCR(blocs: Bloc[]): number {
  let retraits = 0;
  for (let i = blocs.length - 1; i >= 0; i--) {
    if (estDechetOCR(blocs[i].texte)) {
      blocs.splice(i, 1);
      retraits++;
      continue;
    }
    const nettoye = assainirTexte(blocs[i].texte);
    if (nettoye !== blocs[i].texte) blocs[i] = { ...blocs[i], texte: nettoye };
    if (!blocs[i].texte) {
      blocs.splice(i, 1);
      retraits++;
    }
  }
  return retraits;
}

// ── Génération ──
const stats = { fragments: 0, rattrapages: 0, numeros: 0, corrections: 0, ocr: 0, retires: 0, dechets: 0 };
const unitesOut = OKACHA_UNITES.map((u) => {
  const pre = filtrerLignesDechet(u.lignes);
  stats.dechets += pre.n;
  const r = structurize(pre.lignes);
  const corrections = applyFixes(r.blocs);
  stats.retires += nettoieBlocs(r.blocs);
  stats.dechets += filtreDechetOCR(r.blocs);
  stats.fragments += r.fragments;
  stats.rattrapages += r.rattrapages;
  stats.numeros += r.numeros;
  stats.corrections += corrections;
  return {
    id: u.id,
    domaine: u.domaine,
    uniteAr: u.uniteAr,
    sourceRange: u.sourceRange,
    blocs: r.blocs,
    nbPoints: r.blocs.filter((b) => b.kind === 'point').length,
  };
});

// Copie mutable : OKACHA_METHODO.lignes est un tuple readonly (okacha.ts as const).
const meth = sectionsMethodo([...OKACHA_METHODO.lignes]);
stats.corrections += meth.corrections;
stats.fragments += meth.fragments;
stats.rattrapages += meth.rattrapages;
stats.numeros += meth.numeros;
stats.ocr += meth.ocr;
stats.retires += meth.retires;
stats.dechets += meth.dechets;

// 9ᵉ section « nasiha » : قسم النصائح isolé (OKACHA_CONSEILS, ex-d2u2).
{
  const preN = filtrerLignesDechet([...OKACHA_CONSEILS.lignes]);
  stats.dechets += preN.n;
  const r = structurize(preN.lignes);
  const c = applyFixes(r.blocs);
  const o = filtreOcrBlocs(r.blocs);
  stats.retires += nettoieBlocs(r.blocs);
  stats.dechets += filtreDechetOCR(r.blocs);
  stats.corrections += c;
  stats.fragments += r.fragments;
  stats.rattrapages += r.rattrapages;
  stats.numeros += r.numeros;
  stats.ocr += o;
  meth.sections.push({ id: 'nasiha', titreAr: 'نصائح المراجعة والتحضير (قسم النصائح)', blocs: r.blocs });
}

// Comptage précis des corrections : réapplication sur les textes ORIGINAUX.
const fixesOut = Object.entries(FIXES).map(([from, to]) => {
  let count = 0;
  for (const l of [...OKACHA_UNITES.flatMap((u) => u.lignes), ...OKACHA_METHODO.lignes, ...OKACHA_CONSEILS.lignes]) {
    count += l.split(from).length - 1;
  }
  return { from, to, count };
});

function blocTs(b: Bloc): string {
  const num = b.num ? `, num: ${JSON.stringify(b.num)}` : '';
  return `    { kind: ${JSON.stringify(b.kind)}${num}, texte: ${JSON.stringify(b.texte)} }`;
}

const out: string[] = [];
out.push('// okachaEnriched.ts — GÉNÉRÉ par scripts/enrich_okacha.ts — NE PAS ÉDITER À LA MAIN.');
out.push('// 2ᵉ passe OCR + structuration du بنك الحفظ (audit 2026-09-22, phases A+B).');
out.push('// Source : src/data/okacha.ts (injection mécanique v1) — transformations tracées');
out.push('// dans ENRICH_STATS / ENRICH_FIXES. Verrou : src/data/okachaEnriched.lock.test.ts');
out.push('');
out.push("export type BlocKind = 'titre' | 'point' | 'puce' | 'note' | 'texte';");
out.push('');
out.push('export interface BlocOkacha {');
out.push('  kind: BlocKind;');
out.push('  num?: string;');
out.push('  texte: string;');
out.push('}');
out.push('');
out.push('export interface UniteOkachaEnrichie {');
out.push('  id: string;');
out.push('  domaine: 1 | 2 | 3;');
out.push('  uniteAr: string;');
out.push('  sourceRange: string;');
out.push('  blocs: BlocOkacha[];');
out.push('  nbPoints: number;');
out.push('}');
out.push('');
out.push('export interface SousSectionMethodo {');
out.push('  id: string;');
out.push('  titreAr: string;');
out.push('  /** Index du premier bloc (inclus) dans section.blocs. */');
out.push('  from: number;');
out.push('}');
out.push('');
out.push('export interface SectionMethodo {');
out.push('  id: string;');
out.push('  titreAr: string;');
out.push('  blocs: BlocOkacha[];');
out.push('  /** Sous-sections à ids stables (tamarin1) — ancrage par index de bloc. */');
out.push('  sous?: SousSectionMethodo[];');
out.push('}');
out.push('');
out.push('/** Normalisation arabe pour la recherche (miroir de okacha.lock.test.ts). */');
// `normAr.toString()` perd l'annotation (esbuild) — on la réinjecte pour
// garder un fichier généré strict-compliant sans dupliquer la logique.
const normArSrc = normAr.toString().replace(/^\(?\s*s\s*\)?\s*=>/, '(s: string): string =>');
if (!normArSrc.startsWith('(s: string): string =>')) {
  throw new Error('enrich_okacha: forme de normAr.toString() inattendue — réinjecter le typage manuellement');
}
out.push('export const normAr = ' + normArSrc + ';');
out.push('');
out.push('export const OKACHA_UNITES_ENRICHIES: UniteOkachaEnrichie[] = [');
for (const u of unitesOut) {
  out.push('  {');
  out.push(`    id: ${JSON.stringify(u.id)},`);
  out.push(`    domaine: ${u.domaine} as 1 | 2 | 3,`);
  out.push(`    uniteAr: ${JSON.stringify(u.uniteAr)},`);
  out.push(`    sourceRange: ${JSON.stringify(u.sourceRange)},`);
  out.push('    blocs: [');
  for (const b of u.blocs) out.push(blocTs(b) + ',');
  out.push('    ],');
  out.push(`    nbPoints: ${u.nbPoints},`);
  out.push('  },');
}
out.push('];');
out.push('');
out.push('export const OKACHA_METHODO_SECTIONS: SectionMethodo[] = [');
for (const s of meth.sections) {
  out.push('  {');
  out.push(`    id: ${JSON.stringify(s.id)},`);
  out.push(`    titreAr: ${JSON.stringify(s.titreAr)},`);
  if (s.sous && s.sous.length) {
    out.push('    sous: [');
    for (const ss of s.sous) {
      out.push(`      { id: ${JSON.stringify(ss.id)}, titreAr: ${JSON.stringify(ss.titreAr)}, from: ${ss.from} },`);
    }
    out.push('    ],');
  }
  out.push('    blocs: [');
  for (const b of s.blocs) out.push(blocTs(b) + ',');
  out.push('    ],');
  out.push('  },');
}
out.push('];');
out.push('');
out.push('/** Corrections OCR appliquées (haute confiance) — comptées sur les textes sources. */');
out.push('export const ENRICH_FIXES: { from: string; to: string; count: number }[] = [');
for (const f of fixesOut) {
  out.push(`  { from: ${JSON.stringify(f.from)}, to: ${JSON.stringify(f.to)}, count: ${f.count} },`);
}
out.push('];');
out.push('');
out.push("/** Bilan de la passe d'enrichissement (audit 2026-09-22). */");
out.push('export const ENRICH_STATS = {');
out.push(`  fragmentsRecolles: ${stats.fragments},`);
out.push(`  rattrapagesContinuation: ${stats.rattrapages},`);
out.push(`  numerosNormalises: ${stats.numeros},`);
out.push(`  correctionsAppliquees: ${stats.corrections},`);
  out.push(`  blocsRetiresPostFix: ${stats.retires},`);
out.push(`  sectionsMethodo: ${meth.sections.length},`);
out.push(`  pointsTotal: ${unitesOut.reduce((s, u) => s + u.nbPoints, 0)},`);
out.push(`  ocrRetraits: ${stats.ocr},`);
out.push(`  dechetsRetires: ${stats.dechets},`);
out.push("  genere: '2026-09-24',");
out.push('} as const;');
out.push('');

const OUT_PATH = resolve(import.meta.dirname ?? '.', '../src/data/okachaEnriched.ts');
writeFileSync(OUT_PATH, out.join('\n'), 'utf-8');

console.log('[enrich_okacha] généré :', OUT_PATH);
console.log('  unités             :', unitesOut.length);
console.log('  points numérotés   :', unitesOut.reduce((s, u) => s + u.nbPoints, 0));
console.log('  fragments recollés :', stats.fragments);
console.log('  rattrapages        :', stats.rattrapages);
console.log('  numéros normalisés :', stats.numeros);
console.log('  corrections OCR    :', stats.corrections);
console.log('  blocs retirés      :', stats.retires, '(post-fixes, vides ou < 20 car.)');
console.log('  déchets scan (B)   :', stats.dechets, '(score OCR ≥ seuil)');
console.log('  sections méthodo   :', meth.sections.length, '→', meth.sections.map((s) => `${s.id}(${s.blocs.length})`).join(' '));
console.log('  filtre OCR retraits:', stats.ocr);
