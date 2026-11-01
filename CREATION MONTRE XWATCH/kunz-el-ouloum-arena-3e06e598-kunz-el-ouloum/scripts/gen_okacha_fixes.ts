// gen_okacha_fixes.ts — GÉNÉRATEUR de clés FIXES exactes (audit arabe 2026-09-26).
//
// Problème corrigé : des clés du dictionnaire FIXES d'enrich_okacha.ts ne
// correspondaient à AUCUN texte réel (recopie manuelle fautive) → corrections
// silencieusement inopérantes. Ce script extrait la clé VERBATIM depuis
// src/data/okacha.ts via un couple (ancre de début, ancre de fin), garantissant
// l'appariement exact, et imprime les lignes TS prêtes à coller.
//
// Lecture seule. Usage : npx tsx scripts/gen_okacha_fixes.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const src = readFileSync(resolve(process.cwd(), 'src/data/okacha.ts'), 'utf-8');

interface Regle {
  /** ancre de début (doit être unique dans le fichier source) */
  de: string;
  /** ancre de fin INCLUSE (cherchée après « de ») */
  a: string;
  /** texte de remplacement (conforme au livre officiel) */
  vers: string;
  note: string;
}

export const REGLES: Regle[] = [
  {
    de: 'ا-الرونبنات',
    a: 'حيوية ضخمة',
    vers: '1- البروتينات هي جزيئات عضوية حيوية ضخمة',
    note: 'U1 : البروتينات (OCR boustrophedon)',
  },
  {
    de: 'من سلسة ببتيدية أ أكثر',
    a: 'من سلسة ببتيدية أ أكثر',
    vers: 'من سلسلة ببتيدية أو أكثر',
    note: 'U1 : chaine peptidique',
  },
  {
    de: 'بروابط بيبتيدية',
    a: 'بروابط بيبتيدية',
    vers: 'بروابط ببتيدية',
    note: 'U1 : liaison peptidique',
  },
  {
    de: 'أ- ال اللاهو الدعامة',
    a: 'المعلومات الوراثية',
    vers: '2- الـ ADN الدعامة الجزيئية للمعلومات الوراثية',
    note: 'U1 : ADN support de l information génétique',
  },
  {
    de: 'ا لكلونيد: هي الوحدة البناية',
    a: 'رابطة تكافؤية',
    vers:
      '3- النيوكليوتيد: هي الوحدة البنائية لسلاسل الـ ADN، يتركب من ارتباط سكر خماسي منقوص الأكسجين (ديزوكسي ريبوز) بإحدى القواعد الآزوتية الأربعة عن طريق رابطة تكافؤية',
    note: 'U1 : définition du nucléotide',
  },
  {
    de: 'بيورينية وهي الأدنين',
    a: 'واليوراسيل (لا)',
    vers:
      'بيورينية وهي الأدنين (A) والغوانين (G)، وبيريميدينية وهي السيتوزين (C) والتايمين (T) واليوراسيل (U)',
    note: 'U1 : les 4 bases azotées (symboles latins restaurés)',
  },
  {
    de: 'ترتبط النكليوتيدات في السلسلة الواحدة',
    a: 'كما..',
    vers: 'ترتبط النيوكليوتيدات في السلسلة الواحدة بروابط فوسفاتية ثنائية الأستر، كما',
    note: 'U1 : liaison phosphodiester',
  },
  {
    de: 'ما لرب',
    a: 'ما لرب',
    vers: 'ترتبط',
    note: 'U1 : fragment « ترتبط » tronqué par l OCR',
  },
  {
    de: 'نكليوتيدات السلسلة المقابلة',
    a: 'نكليوتيدات السلسلة المقابلة',
    vers: 'نيوكليوتيدات السلسلة المقابلة',
    note: 'U1 : graphie officielle نيوكليوتيدات',
  },
  {
    de: '-المورثة هي قطعة من ال ADN حاملة',
    a: 'بأليلين محمهل',
    vers:
      '8- المورثة هي قطعة من الـ ADN حاملة لصفة وراثية معينة، وتمثل كل مورثة داخل النواة بأليلين محمّلين على',
    note: 'U1 : définition de la مورثة + الأليلين',
  },
  {
    de: 'تحدد من النيكليوتيدات',
    a: 'الآزلب,',
    vers: 'محدّد من النيوكليوتيدات (القواعد الآزوتية،',
    note: 'U1 : تتابع النيوكليوتيدات',
  },
  {
    de: 'وحداتما النائة',
    a: 'وحداتما النائة',
    vers: 'وحداتها البنائية',
    note: 'U1 : unités structurales',
  },
  {
    de: 'يتعح غن عملية التعبير المورثي',
    a: 'يتعح غن عملية التعبير المورثي',
    vers: 'ينتج عن عملية التعبير المورثي',
    note: 'U1 : rapport de causalité (النمط الظاهري)',
  },
  {
    de: 'يظهر عند الفردني ثلاث مستويات',
    a: 'يظهر عند الفردني ثلاث مستويات',
    vers: 'يظهر عند الفرد على ثلاث مستويات',
    note: 'U1 : les trois niveaux du phénotype',
  },
  {
    de: '(النمة الظاهري)',
    a: '(النمة الظاهري)',
    vers: '(النمط الظاهري)',
    note: 'U1 : النمط الظاهري',
  },
  {
    de: 'والترجمة في اليلن عند حقيقيات النوى',
    a: 'والترجمة في اليلن عند حقيقيات النوى',
    vers: 'والترجمة في الهيولى عند حقيقيات النوى',
    note: 'U1 : الهيولى (siège de la traduction)',
  },
  {
    de: 'نكامل القواعد الآزوتية',
    a: 'نكامل القواعد الآزوتية',
    vers: 'تكامل القواعد الآزوتية',
    note: 'U1 : مبدأ تكامل القواعد الآزوتية',
  },
  {
    de: 'ا1- العناصر الضرورية لعملية الاستنساخ',
    a: 'ا1- العناصر الضرورية لعملية الاستنساخ',
    vers: '11- العناصر الضرورية لعملية الاستنساخ',
    note: 'U1 : numérotation (OCR ا1 → 11)',
  },
  {
    de: 'والطاقة اللازمة لعملية النسخ في',
    a: 'والطاقة اللازمة لعملية النسخ في',
    vers: 'والطاقة اللازمة لعملية النسخ في شكل ATP.',
    note: 'U1 : énergie sous forme d ATP (complément officiel)',
  },
  {
    de: '"أمثي" يكرف ساف',
    a: 'أدينوزين ثلاثي الفوسفات).',
    vers: '',
    note: 'U1 : résidu scan illisible (retrait — zéro invention)',
  },
  {
    de: 'غاد منه املية علي اللفة لورية',
    a: 'مع امتالال الألميث',
    vers: '',
    note: 'U1 : résidu scan illisible (retrait)',
  },
  {
    de: ') يقابلها و6 يقابلها).',
    a: ') يقابلها و6 يقابلها).',
    vers: '',
    note: 'U1 : fragment résiduel (retrait)',
  },
  {
    de: 'الاستطالة: يننقل الإنزيم',
    a: 'الاستطالة: يننقل الإنزيم',
    vers: 'الاستطالة: ينتقل الإنزيم',
    note: 'U1 : conjugaison (ينتقل)',
  },
  {
    de: 'في فراءة نلا النكليوتيدات',
    a: 'في فراءة نلا النكليوتيدات',
    vers: 'في قراءة تتابع النيوكليوتيدات',
    note: 'U1 : قراءة تتابع النيوكليوتيدات',
  },
  {
    de: '24 الاستنساخ المتعدد',
    a: 'بصورة متزامنة بنفس المورئة',
    vers: '24- الاستنساخ المتعدد هو ارتباط عدة جزيئات من إنزيم الاستنساخ بصورة متزامنة بنفس المورثة',
    note: 'U1 : الاستنساخ المتعدد (المورثة)',
  },
  {
    de: 'لنشك عدة نسخ',
    a: 'لنشك عدة نسخ',
    vers: 'لتشكيل عدة نسخ',
    note: 'U1 : morphologie (لتشكيل)',
  },
  {
    de: 'من جزيئة الا ا٨00٣ القابلة للترجمة',
    a: 'من جزيئة الا ا٨00٣ القابلة للترجمة',
    vers: 'من جزيئة الـ ARNm القابلة للترجمة',
    note: 'U1 : ARNm (symbole restauré)',
  },
  {
    de: 'يتم من خلالهاالاصطناع الحيوي',
    a: 'يتم من خلالهاالاصطناع الحيوي',
    vers: 'يتم من خلالها الاصطناع الحيوي',
    note: 'U1 : espace manquant (الاصطناع الحيوي)',
  },
  {
    de: 'من خلال ترجمة الرساة الوراثية',
    a: 'من خلال ترجمة الرساة الوراثية',
    vers: 'من خلال ترجمة الرسالة الوراثية',
    note: 'U1 : الرسالة الوراثية',
  },
  {
    de: '(لا، ٨، )، 6)',
    a: '(لا، ٨، )، 6)',
    vers: '(A، G، C، U)',
    note: 'U1 : alphabet de la langue nucléique (4 symboles)',
  },
];

// ── Runner : extraction verbatim + impression des lignes TS prêtes à coller ──
const echappe = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
let ok = 0;
let ko = 0;
const sortie: string[] = [];
for (const r of REGLES) {
  const n = src.split(r.de).length - 1;
  if (n !== 1) {
    console.log(`*** ANCRE « de » NON UNIQUE (${n}) : ${JSON.stringify(r.de.slice(0, 50))}`);
    ko++;
    continue;
  }
  const i = src.indexOf(r.de);
  const j = src.indexOf(r.a, i);
  if (j < 0) {
    console.log(`*** ANCRE « a » INTROUVABLE : ${JSON.stringify(r.a.slice(0, 50))}`);
    ko++;
    continue;
  }
  const cle = src.slice(i, j + r.a.length).replace(/\n/g, ' ');
  sortie.push(`  '${echappe(cle)}': '${echappe(r.vers)}', // ${r.note}`);
  ok++;
}
console.log(sortie.join('\n'));
console.log(`\n// regles OK : ${ok} · KO : ${ko}`);
