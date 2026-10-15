// politiqueConfidentialite.ts — SOURCE UNIQUE du texte de confidentialité.
// Affiché depuis SplashView (la mention « بالانضمام إلينا، أنت توافق… » pointe ici).
// Règle d'honnêteté : ce texte décrit CE QUE LE CODE FAIT RÉELLEMENT
// (vérifié par audit 2026-09-20 : register bcrypt, JWT 7j, /api/student/sync
// par lots, mode invité sans envoi, export CSV prof, reset par code enseignant).
// Aucune promesse que le code ne tient. Référence légale générique (loi 18-07)
// sans interprétation : la conformité formelle relève du responsable de l'app.

export const DERNIERE_MISE_A_JOUR = '2026-09-20';
/** Contact affiché sur la page publique (H2) — même règle qu'ici : rien d'inventé. */
export const CONTACT_PUBLIC = 'kunzelouloum@gmail.com';

export interface SectionConfidentialite {
  titre: string;
  paragraphes: string[];
}

export const SECTIONS_CONFIDENTIALITE: SectionConfidentialite[] = [
  {
    titre: '١. ما نجمعه',
    paragraphes: [
      'عند إنشاء حساب: الاسم الظاهر، البريد الإلكتروني، وكلمة المرور.',
      'أثناء الاستعمال: إنتاجاتك الكتابية (نص الأجوبة، درجة التوافق ICM، الأخطاء المصنفة)، وأحداث النشاط (الاختبارات والمهام) مع تواريخها.',
      'لا نجمع أبدا: رقم الهاتف، العنوان، الصور الشخصية، ولا أي معلومة حساسة أخرى.',
    ],
  },
  {
    titre: '٢. لماذا نجمعه',
    paragraphes: [
      'لتتبع تقدمك: مواضيع قوتك وأخطائك المتكررة، وظهورها في لوحة متابعة الأستاذ.',
      'لإحصاءات مجمعة عن استخدام التطبيق (عدد النشطين أسبوعيا وشهرا) لتحسين المحتوى.',
    ],
  },
  {
    titre: '٣. كيف نحميها',
    paragraphes: [
      'كلمة المرور لا تُخزن أبدا كنص صريح: تُشفَّر (bcrypt) قبل الحفظ، ولا يستطيع أحد — ولا نحن — قراءتها.',
      'الاتصال بالخادم محمي، والوصول إلى بياناتك يتم برموز دخول شخصية (JWT) تنتهي صلاحيتها تلقائيا.',
      'في وضع الزائر (دون حساب): لا يغادر أي شيء هاتفك إطلاقا — ملفاتك تبقى محلية.',
    ],
  },
  {
    titre: '٤. ما لا نفعله أبدا',
    paragraphes: [
      'لا نبيع بياناتك ولا نشاركها مع أي طرف ثالث.',
      'لا يوجد إعلانات، ولا أدوات تتبع خارجية (analytics خارجية) في التطبيق.',
      'الوصول إلى بياناتك محصور بالأستاذ المشرف وعلى حسابك أنت فقط.',
    ],
  },
  {
    titre: '٥. حقوقك',
    paragraphes: [
      'يمكنك طلب حذف حسابك وجميع بياناتك في أي وقت عبر الأستاذ المشرف.',
      'يمكن للأستاذ تصدير بياناتك (CSV) وتسليمك نسخة منها.',
      'استعادة كلمة المرور تتم برمز يولده الأستاذ المشرف — لا نرسل بريدا إلكترونيا تلقائيا.',
    ],
  },
  {
    titre: '٦. التلاميذ والأولياء',
    paragraphes: [
      'التطبيق موجه لتلاميذ السنة الثالثة ثانوي. ننصح باستعماله بإشراف الولي.',
      'نسأل الحد الأدنى من المعلومات (اسم ظاهر + بريد) ولا نطلب أي معلومة حساسة.',
    ],
  },
  {
    titre: '٧. الإطار القانوني والاتصال',
    paragraphes: [
      'تُعالج المعطيات وفق القانون الجزائري 18-07 المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي.',
      'لأي سؤال أو طلب حذف: تواصل مع الأستاذ المشرف بتطبيقك.',
    ],
  },
];

/**
 * VERSION FRANÇAISE — ajoutée le 14/10/2026 pour la fiche Play Store (H2).
 *
 * Pourquoi une traduction : Google exige une URL de politique de confidentialité
 * PUBLIQUE et lisible par le relecteur ; une page uniquement en arabe rend la
 * vérification difficile pour un examinateur non arabophone, ce qui est un motif
 * classique de rejet. Le texte ARABE ci-dessus reste la version de référence :
 * cette traduction le suit section par section, sans ajouter ni retirer aucune
 * promesse. Elle ne décrit rien que le code ne fasse — mêmes faits vérifiés
 * (bcrypt, JWT 7 j, aucune publicité, aucun traceur tiers, mode invité local).
 */
export const SECTIONS_CONFIDENTIALITE_FR: SectionConfidentialite[] = [
  {
    titre: '1. Ce que nous collectons',
    paragraphes: [
      'À la création d’un compte : le nom d’affichage, l’adresse e-mail et le mot de passe.',
      'Pendant l’utilisation : vos productions écrites (texte des réponses, score de conformité ICM, erreurs classées) et les événements d’activité (tests et tâches) avec leurs dates.',
      'Nous ne collectons jamais : numéro de téléphone, adresse, photos personnelles, ni aucune autre donnée sensible.',
    ],
  },
  {
    titre: '2. Pourquoi nous les collectons',
    paragraphes: [
      'Pour suivre votre progression : vos points forts, vos erreurs récurrentes, et leur affichage sur le tableau de bord de l’enseignant.',
      'Pour des statistiques agrégées d’usage (nombre d’actifs par semaine et par mois), afin d’améliorer le contenu.',
    ],
  },
  {
    titre: '3. Comment nous les protégeons',
    paragraphes: [
      'Le mot de passe n’est jamais stocké en clair : il est chiffré (bcrypt) avant enregistrement, et personne — pas même nous — ne peut le lire.',
      'La communication avec le serveur est protégée, et l’accès à vos données se fait par jetons de session personnels (JWT) à expiration automatique.',
      'En mode invité (sans compte) : rien ne quitte votre téléphone, vos fichiers restent locaux.',
    ],
  },
  {
    titre: '4. Ce que nous ne faisons jamais',
    paragraphes: [
      'Nous ne vendons pas vos données et ne les partageons avec aucun tiers.',
      'Il n’y a aucune publicité et aucun outil de traçage externe (analytique tierce) dans l’application.',
      'L’accès à vos données est limité à l’enseignant superviseur et à votre propre compte.',
    ],
  },
  {
    titre: '5. Vos droits',
    paragraphes: [
      'Vous pouvez demander la suppression de votre compte et de toutes vos données à tout moment, via l’enseignant superviseur.',
      'L’enseignant peut exporter vos données (CSV) et vous en remettre une copie.',
      'La récupération du mot de passe se fait par un code généré par l’enseignant superviseur — nous n’envoyons aucun e-mail automatique.',
    ],
  },
  {
    titre: '6. Élèves et parents',
    paragraphes: [
      'L’application s’adresse aux élèves de troisième année secondaire. Nous recommandons de l’utiliser sous la supervision d’un parent.',
      'Nous demandons le minimum d’informations (nom d’affichage + e-mail) et ne demandons aucune donnée sensible.',
    ],
  },
  {
    titre: '7. Cadre légal et contact',
    paragraphes: [
      'Les données sont traitées conformément à la loi algérienne 18-07 relative à la protection des personnes physiques dans le traitement des données à caractère personnel.',
      'Pour toute question ou demande de suppression : contactez l’enseignant superviseur de votre application.',
    ],
  },
];
