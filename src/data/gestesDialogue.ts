// ============================================================
// gestesDialogue.ts — LES GESTES HUMAINS QUE LE TUTEUR DOIT ENTENDRE.
//
// POURQUOI CE FICHIER EXISTE (audit mesuré du 14/10/2026, défaut §5.2).
// Sur 11 gestes humains testés, 10 recevaient le même refus :
//   « ❓ هذا السؤال خارج قاعدة علوم الطبيعة والحياة للبكالوريـا »
// — pour `السلام عليكم`, `شكرا`, `مافهمت والو`, `أعد من فضلك`…
//
// Un professeur ne refuse pas « je n'ai pas compris ». Le refus « hors
// programme » doit rester réservé aux questions **hors discipline** (football,
// cuisine, politique) ; il ne doit jamais tomber sur un élève qui parle de lui.
//
// RÈGLES DE RÉDACTION (AGENTS.md règle 5 et KEO-201) :
//   · DÉTECTION en arabe standard ET darija ; SORTIE strictement en فصحى —
//     la darija d'entrée n'est jamais reproduite.
//   · Jamais de note, de compliment creux, ni de discours motivationnel.
//   · Court (lisible sur un téléphone), et TOUJOURS terminé par une action
//     concrète : le geste humain doit ramener au travail, pas le retarder.
// ============================================================

export interface GesteDialogue {
  id: string;
  /** Formes reconnues. DÉTECTION uniquement — jamais affichées telles quelles. */
  declencheurs: string[];
  /** Réponse, strictement en فصحى. */
  reponseAr: string;
  /** Boutons proposés : une action concrète, jamais une récompense verbale. */
  actionsAr: string[];
}

/** Les boutons de triage proposés quand l'élève dit qu'il n'a pas compris. */
const TRIAGE = ['أعطني مثال', 'اشرح لي ببساطة', 'راجع أخطائي السابقة'];

export const GESTES_DIALOGUE: GesteDialogue[] = [
  {
    id: 'ou_commencer',
    declencheurs: [
      'من اين ابدا', 'من أين أبدأ', 'منين نبدا', 'وين نبدا', 'من اين ابدأ',
      'لا اعرف من اين ابدا', 'لا أعرف من أين أبدأ', 'ما نعرفش منين نبدا',
      'من اين نبدا', 'كيف ابدأ', 'كيف أبدأ', 'كيفاش ندير', 'كيفاه ندير',
      'كيف ندير', 'واش ندير', 'كيفاش نبدا',
    ],
    reponseAr:
      'ابدأ من موضع واحد فقط، لا من البرنامج كلّه.\n\n' +
      '👉 افتح المجال الذي تجده أصعب، واقرأ **بطاقته الأولى** — ثمّ سؤال تثبيت واحد. **10 دقائق** ثمّ نتوقّف.',
    actionsAr: TRIAGE,
  },
  {
    id: 'exemple',
    declencheurs: [
      'اعطني مثال', 'أعطني مثال', 'مثال', 'مثالا', 'مثلا', 'اعطني مثالا',
      'أعطني مثالاً', 'مثال من فضلك', 'حل مثال', 'تمرين',
    ],
    reponseAr:
      'المثال الصادق في هذه المادة هو **سؤال بكالوريا حقيقي**، لا مثال من عندي.\n\n' +
      '👉 اختر الوحدة التي تريد، ثمّ حلّ سؤالها الأول وحدك — ثمّ نصحّح معاً.',
    actionsAr: ['العودة للقائمة الرئيسية'],
  },
  {
    id: 'repete',
    declencheurs: [
      'اعد من فضلك', 'أعد من فضلك', 'اعد السؤال', 'أعد السؤال', 'عاود', 'عاودلي',
      'كرر', 'كرّر', 'ما سمعتك', 'ما شفتش', 'ما فهمت السؤال', 'اعيد', 'أعيد',
    ],
    reponseAr:
      'لا أستطيع إعادة النصّ السابق — لا أحتفظ به بعد أن ترسله.\n\n' +
      '👉 اضغط الزرّ نفسه مرّة أخرى، أو أعِد كتابة سؤالك بكلماتك.',
    actionsAr: ['العودة للقائمة الرئيسية'],
  },
  {
    id: 'simplifie',
    declencheurs: [
      'اشرح لي ببساطة', 'ببساطة', 'بساطة', 'بسطلي', 'بسّط', 'بشوية', 'شوية شوية',
      'خطوة بخطوة', 'سهل لي', 'شرح سهل', 'بسط لي', 'فسر ببساطة',
    ],
    reponseAr:
      'أبسط صيغة عندي هي **جملة البطاقة**: جملة واحدة تحمل الفكرة، ثمّ سؤال تثبيت واحد.\n\n' +
      '👉 اضغط زرّ المراجعة الذي تريده، وسأعطيك الجملة الواحدة قبل أي تفصيل.',
    actionsAr: ['العودة للقائمة الرئيسية'],
  },
  {
    id: 'incomprehension',
    declencheurs: [
      'مافهمت والو', 'ما فهمت والو', 'مافهمتش', 'ما فهمتش', 'مافهمت', 'ما فهمت',
      'ماني فاهم', 'مانيش فاهم', 'مش فاهم', 'ما استوعبت', 'ماستوعبتش',
      'مازال ما فهمتش', 'صعيب', 'صعيب علي', 'صعبة', 'مافهمت شيء', 'ما فهمت شيء',
      'لم افهم', 'لم أفهم', 'لا افهم', 'لا أفهم',
      // Élisions de l'oral : le « هم » central tombe (« مافهت ») et la voyelle
      // finale aussi. Ces graphies n'ont aucun sens disciplinaire, elles ne
      // peuvent donc rien voler aux cours.
      'مافهت', 'ما فهت', 'مافهت والو', 'ما فهت والو',
    ],
    reponseAr:
      'لا مشكلة — الشرح الذي لم يُفهم ليس شرحاً بعد.\n\n' +
      '👉 حدّد لي موضع العقدة: **المصطلح**، أم **الخطوات**، أم **العلاقة بينهما**؟ اختر من الأسفل، أو اكتب الكلمة التي توقّفت عندها.',
    actionsAr: TRIAGE,
  },
  {
    id: 'echec',
    declencheurs: [
      'رسبت', 'رسبت في الفرض', 'مانجحتش', 'ما نجحتش', 'فشلت', 'جبت 5', 'جبت 08',
      'معدلي ضعيف', 'نقطة ضعيفة', 'ضعيف في', 'ضعيفة في', 'جبت نقطة ضعيفة',
    ],
    reponseAr:
      'النقطة تصف عملاً سابقاً، لا قدرة ثابتة — وهذا فرق يغيّر النتيجة.\n\n' +
      '👉 سنأخذ **الأخطاء المسجّلة عندك هنا**، واحداً واحداً. هذا أوثق طريق إلى نقطة أعلى من التركيز على كلّ شيء.',
    actionsAr: ['راجع أخطائي السابقة', 'العودة للقائمة الرئيسية'],
  },
  {
    id: 'salutation',
    declencheurs: [
      'السلام عليكم', 'سلام عليكم', 'وعليكم السلام', 'صباح الخير', 'مساء الخير',
      'مرحبا', 'مرحباً', 'اهلا', 'أهلا', 'اهلا وسهلا', 'أهلا وسهلا', 'صباح النور',
    ],
    reponseAr: 'وعليكم السلام ورحمة الله. أنا جاهز.\n\n👉 اختر مجالاً من الأسفل، أو اكتب سؤالك مباشرةً.',
    actionsAr: [],
  },
  {
    id: 'remerciement',
    declencheurs: [
      'شكرا', 'شكراً', 'مشكور', 'بارك الله فيك', 'جزاك الله', 'الله يبارك',
      'يعطيك الصحة', 'تعيش', 'مرسي',
    ],
    reponseAr:
      'على الرُّحب. ولا تقبل منّي مجاملةً — أثبِت المعلومة بدلاً منها:\n\n' +
      '👉 أعِدها في **جملة واحدة من ذاكرتك**، دون فتح الدرس. هذا هو الامتحان الحقيقي.',
    actionsAr: ['راجع أخطائي السابقة', 'العودة للقائمة الرئيسية'],
  },
  {
    id: 'adieu',
    declencheurs: [
      'بسلامة', 'بسلامه', 'وداعا', 'وداعاً', 'الى اللقاء', 'إلى اللقاء',
      'راني نمشي', 'نشوفك', 'سلام عليكم ورحمة الله وبركاته',
    ],
    reponseAr:
      'في أمان الله.\n\n' +
      '👉 قبل أن تخرج، أعِد في ذهنك **جملة واحدة** من آخر درس مررنا به — كافية اليوم، وتُثبَّت غداً.',
    actionsAr: [],
  },
];
