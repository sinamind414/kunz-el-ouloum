// gen_okacha_fixes2.ts — GÉNÉRATEUR v2 de clés FIXES exactes (audit arabe 2026-09-26).
//
// Objectif : produire des clés de dictionnaire qui correspondent EXACTEMENT au
// texte RUNTIME des blocs de src/data/okacha.ts.
//   · extraction verbatim par couple (ancre début, ancre fin) — même ligne ;
//   · conversion des échappements TS du fichier source (\", \t) vers le texte
//     runtime, car applyFixes compare des chaînes runtime ;
//   · refus de toute règle dont le couple d'ancres est ambigu ou multi-ligne.
// Lecture seule. Usage : npx tsx scripts/gen_okacha_fixes2.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const brut = readFileSync(resolve(process.cwd(), 'src/data/okacha.ts'), 'utf-8');
const src = brut.replace(/\\"/g, '"').replace(/\\t/g, '\t');

interface Regle {
  de: string;
  a: string;
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
    de: 'بروابط بيبتيدية.',
    a: 'بروابط بيبتيدية.',
    vers: 'بروابط ببتيدية.',
    note: 'U1 : liaison peptidique',
  },
  {
    de: 'أ- ال اللاهو الدعامة',
    a: 'الجزيئية للمعلومات الوراثية',
    vers: '2- الـ ADN الدعامة الجزيئية للمعلومات الوراثية',
    note: 'U1 : ADN support de l information génétique',
  },
  {
    de: 'داخل أنوية الخلايا',
    a: 'ما يعرف بالصبغيات الكوموسومات)',
    vers:
      'داخل أنوية الخلايا حقيقية النواة (eucaryote)، تلتف حول البروتينات الهيستونية (الهيستونات) مشكّلة ما يعرف بالصبغيات (الكروموسومات)',
    note: 'U1 : noyau eucaryote + histones + chromatine',
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
    a: 'والغوانين (6)',
    vers: 'بيورينية وهي الأدنين (A) والغوانين (G)',
    note: 'U1 : bases puriques (symboles latins restaurés)',
  },
  {
    de: 'وبيريميدينية وهي السيتوزين',
    a: 'واليوراسيل (لا)',
    vers: 'وبيريميدينية وهي السيتوزين (C) والتايمين (T) واليوراسيل (U)',
    note: 'U1 : bases pyrimidiques (symboles latins restaurés)',
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
    de: 'الحمض النووي الريبي الرسول',
    a: 'الغلاف النووي)',
    vers:
      'الحمض النووي الريبي الرسول (ARNm) وسيط كيموحيوي ينقل نسخة من المعلومة الوراثية الموجودة في النواة إلى مقر تركيب البروتين على مستوى الهيولى (تتعذّر المورثة على الانتقال مباشرة إلى الهيولى نظراً لكبر قطرها مقارنة بقطر ثقوب الغلاف النووي).',
    note: 'U1 : définition officielle de l ARNm',
  },
  {
    de: 'وا- الاستتاخ ظاهرة حيوية',
    a: 'وذلك حسب مبدا',
    vers:
      'الاستنساخ ظاهرة حيوية (المرحلة الأولى للتعبير المورثي) تحدث على مستوى النواة، يتم فيها تركيب جزيئة ARNm انطلاقاً من إحدى سلسلتي الـ ADN تسمى السلسلة المستنسخة أو الناسخة، وذلك حسب مبدأ',
    note: 'U1 : définition de l استنساخ (texte officiel)',
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
    note: 'U1 : numérotation (OCR ا1 vers 11)',
  },
  {
    de: 'والطاقة اللازمة لعملية النسخ في',
    a: 'والطاقة اللازمة لعملية النسخ في',
    vers: 'طاقة ATP اللازمة لعملية النسخ.',
    note: 'U1 : énergie sous forme d ATP — valeur SANS le texte de la clé (sinon while(includes) boucle)',
  },
  {
    de: 'يكرف ساف وففو',
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
    de: 'مشروع ءكاشة لاطالس',
    a: 'فا ن سلسلة',
    vers:
      'يقوم إنزيم ARN بوليميراز بقراءة تتابع النيوكليوتيدات (الشيفرة الوراثية) على السلسلة المستنسخة، ويربط النيوكليوتيدات الحرة المتكاملة معها في سلسلة ARNm المتشكلة، بحيث يقابل A في الـ ARNm القاعدة U، و T يقابلها A، و C يقابلها G، و G يقابلها C.',
    note: 'U1 : الاقتران بالتكامل القاعدي (texte officiel)',
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

const echappe = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
let ok = 0;
let ko = 0;
const sortie: string[] = [];
for (const r of REGLES) {
  const n = src.split(r.de).length - 1;
  if (n !== 1) {
    console.log(`*** ANCRE de NON UNIQUE (${n}) : ${JSON.stringify(r.de.slice(0, 45))}`);
    ko++;
    continue;
  }
  const i = src.indexOf(r.de);
  const j = src.indexOf(r.a, i);
  if (j < 0) {
    console.log(`*** ANCRE a INTROUVABLE : ${JSON.stringify(r.a.slice(0, 45))}`);
    ko++;
    continue;
  }
  const cle = src.slice(i, j + r.a.length);
  if (cle.includes('\n') || cle.includes('\r')) {
    console.log(`*** REGLE MULTI-LIGNE (inapplicable par bloc) : ${JSON.stringify(r.de.slice(0, 45))}`);
    ko++;
    continue;
  }
  sortie.push(`  '${echappe(cle)}': '${echappe(r.vers)}', // ${r.note}`);
  ok++;
}
console.log(sortie.join('\n'));
console.log(`\n// regles OK : ${ok} · KO : ${ko}`);
