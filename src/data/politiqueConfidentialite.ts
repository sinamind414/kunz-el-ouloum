// politiqueConfidentialite.ts — SOURCE UNIQUE du texte de confidentialité.
// Affiché depuis SplashView (la mention « بالانضمام إلينا، أنت توافق… » pointe ici).
// Règle d'honnêteté : ce texte décrit CE QUE LE CODE FAIT RÉELLEMENT
// (vérifié par audit 2026-09-20 : register bcrypt, JWT 7j, /api/student/sync
// par lots, mode invité sans envoi, export CSV prof, reset par code enseignant).
// Aucune promesse que le code ne tient. Référence légale générique (loi 18-07)
// sans interprétation : la conformité formelle relève du responsable de l'app.

export const DERNIERE_MISE_A_JOUR = '2026-09-20';

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
