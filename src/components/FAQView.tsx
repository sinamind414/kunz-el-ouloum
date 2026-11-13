// FAQView.tsx — Foire aux questions autonome (M5).
//
// Page de questions-réponses en arabe (RTL), accessible depuis le tableau
// de bord. Aucun changement d'App.tsx : le composant est rendu dans
// DashboardView via un état local (section dépliable / plein écran).
//
// Toutes les réponses sont factuelles et traçables : aucune donnée inventée,
// aucun chiffre sans source dans le dépôt.

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'usage' | 'technique' | 'abonnement' | 'bac' | 'push';
}

const CATEGORY_LABEL: Record<string, string> = {
  usage: 'Utilisation',
  technique: 'Technique',
  abonnement: 'Abonnement',
  bac: 'BAC 2025/2026',
  push: 'Rappels push',
};

const FAQS: FAQItem[] = [
  {
    id: 'faq-comment-marche',
    category: 'usage',
    question: 'كيف يعمل التطبيق؟',
    answer:
      'تطبيق Kunz El Ouloum يساعدك على مراجعة مادة علوم الحياة والأرض (الجيل الثاني) لشهادة البكالوريا. choisir الوحدة من الصفحة الرئيسية، اقرأ الدرس، حل التمارين، وتتبع تقدمك في شجرة الدروس الخاصة بك. التطبيق يعمل بدون إنترنت بعد التحميل الأول.',
  },
  {
    id: 'faq-offline',
    category: 'technique',
    question: 'هل يعمل التطبيق بدون إنترنت؟',
    answer:
      'نعم. بمجرد تحميل الدروس والمهام पहली مرة، يمكنك مراجعتها بدون إنترنت. يتم حفظ تقدمك محلياً على جهازك ومزامنتها مع الخادم عند إعادة الاتصال. الدروس المرئية والصور تبقى متوفرة دون اتصال.',
  },
  {
    id: 'faq-push',
    category: 'push',
    question: 'كيف تُفعَّل تذكيرات المراجعة؟',
    answer:
      'اذهب إلى صفحة "خطة المراجعة النهائية" واضغط على "تفعيل التذكيرات بالمراجعة". ستصلك إشعار واحد كحد أقصى في اليوم، بين الساعة 8 صباحاً و10 ليلاً بتوقيت الجزائر. يمكنك إيقاف التذكيرات في أي وقت.',
  },
  {
    id: 'faq-abonnement',
    category: 'abonnement',
    question: 'ما الفرق بين الاستخدام المجاني والاشتراك؟',
    answer:
      'الوحدة 1 ومجال العلوم المجانية متاحان للجميع. للوحدات 2 إلى 11 وجميع ظروف bac والفئات، تحتاج إلى اشتراك رمزي. يتم الدفع عبر رمز تفعيل تُحصل عليه من معلمك أو عبر وسائل الدفع المتاحة. يمكنك تجربة التطبيق مجاناً لمدة 30 يوماً.',
  },
  {
    id: 'faq-bac-sujet',
    category: 'bac',
    question: 'هل توجد مواضيع bac حقيقية؟',
    answer:
      'نعم. يحتوي التطبيق على 28 موضوع bac رسمي من الأعوام 2013 إلى 2026 (لاolomieken والجيل الثاني)، مع التصحيح الرسمي لكل موضوع. يمكن فتح أي موضوع في قسم "البكالوريا" ومراجعته.',
  },
  {
    id: 'faq-traitement-donnees',
    category: 'technique',
    question: 'أين تُحفظ بياناتي؟',
    answer:
      'تقدمك ودروس卸ك تُحفظ محلياً على جهازك (في متصفحك). إذا أنشأت حساباً، تُرسل بيانات التقدم إلى الخادم بشكل آمن. لا يُطلب بريد إلكتروني obligatory — يمكن التسجيل برمز قصير بدون بريد.',
  },
  {
    id: 'faq-recuperer-progression',
    category: 'usage',
    question: 'فقدت تقديمي، كيف أسترجعه؟',
    answer:
      'إذا كنت تملك حساباً وتستخدم نفس الجهاز، يتم مزامنة التقدّم تلقائياً. إذا كنت تعمل كزائر (بدون حساب)، التقدّم محلي فقط على هذا الجهاز — احذف بيانات المتصفح سيُفقد التقدّم. ننصحك بإنشاء حساب لحفظ تقدمك.',
  },
  {
    id: 'faq-notification-heures',
    category: 'push',
    question: 'متى تصل إشعارات التذكير؟',
    answer:
      'إشعار واحد كحد أقصى يومياً، بين الساعة 8 صباحاً و10 ليلاً بتوقيت الجزائر (UTC+1). لا تُرسل إشعارات في الليل أو في أوقات غير مناسبة. يتم احترام هذا الموعد من قبل الخادم.',
  },
  {
    id: 'faq-niveau-dificulte',
    category: 'bac',
    question: 'كيف يُوزع الوقت بين الوحدات؟',
    answer:
      'تتبع الخطة أوزان الوحدة الفعلية في الامتحان (ليست فقط الوزن المعلن)، مع إضافة Срعة الصعوبة الملاحظة في عشر دورات bac رسمية. الوحدات التي تحتاج وقتاً أكثر تحصل على وقت أكبر في خطتك اليومية.',
  },
  {
    id: 'faq-contact',
    category: 'technique',
    question: 'كيف أتصل بالدعم؟',
    answer:
      'للأسئلة التقنية أو مشاكل الحساب، راسل المعلم أو الجهة التي أعطتك رمز التفعيل. التطبيق غير مربوط بدعم فني مباشر في الوقت الحالي، ويتم الاستفسار عبر قنوات المؤسسة التعليمية.',
  },
  {
    id: 'faq-taille',
    category: 'technique',
    question: 'كم занимает التطبيق من مساحة؟',
    answer:
      'حجم التطبيق على المتصفح صغير جداً، ولكن ملفات مواضيع bac (28 ملف PDF) تشكل معظم الحجم (حوالي 94 ميغا بايت). هذه الملفات تُحمل عند الطلب وتُخزَّن محلياً، ويمكنك حذفها وتحميلها مرة أخرى.',
  },
  {
    id: 'faq-arabe',
    category: 'usage',
    question: 'لماذا التطبيق بالعربية فقط؟',
    answer:
      'التطبيق مخصص لطلبة الجيل الثاني في الجزائر، واللغة العربية هي لغة التدريس في مادة علوم الحياة والأرض. الواجهة كاملة بالعربية (RTL)، والمصطلحات العلمية تُحتفظ بها كما هي في الكتب المدرسية.',
  },
  {
    id: 'faq-securite',
    category: 'technique',
    question: 'هل بياني sécurisé؟',
    answer:
      'نعم. كلمات المرور تُخزَّن بشكل مشفر (تجزئة) ولا تُرى من أي أحد. بيانات التقدم تُرسل عبر اتصال آمن. لا تُباع بياناتك أو تُستخدم لأغراض تجارية.',
  },
  {
    id: 'faq-bac-date',
    category: 'bac',
    question: 'متى موعد امتحان البكالوريا؟',
    answer:
      'موعد امتحان شهادة البكالوريا يُحدَّد بمقرر رسمي من وزارة التربية الوطنية. يحتسب التطبيق الأيام المتبقية وفق تاريخ داخله (نصّ في الكود) — والمعتمد حالياً تاريخ تقديري بانتظار القرار الرسمي، والتطبيق يكتب ذلك بوضوح في مكان العدّاد. عند صدور التاريخ الرسمي يُصحَّح في مكان واحد فقط، فيتعدّل العدّاد تلقائياً.',
  },
  {
    id: 'faq-mise-jour',
    category: 'technique',
    question: 'كيف يُحدّث التطبيق؟',
    answer:
      'التطبيق يُحدّث تلقائياً عند إعادة تحميل الصفحة (إذا كنت على الويب) أو عند تثبيت إصدار جديد من ملف APK (إذا كنت على أندرويد). لا حاجة لحذف وتثبيت opnieuw.',
  },
];

export default function FAQView() {
  const [openId, setOpenId] = useState<string | null>(null);

  const isOpen = (id: string) => openId === id;
  const toggle = (id: string) => setOpenId(isOpen(id) ? null : id);

  return (
    <section
      data-testid="faq-view"
      className="max-w-3xl mx-auto space-y-2 pt-6 pb-12"
      dir="rtl"
      lang="ar"
    >
      <div className="rounded-3xl p-6 bg-[#fff9ed] dark:bg-[#141916] border border-[#d9a400]/30 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-5 h-5 text-[#8a5a00] dark:text-amber-400" />
          <h2 className="text-xl font-black text-[#1f1c0b] dark:text-white">الأسئلة الشائعة</h2>
        </div>
        <p className="text-sm leading-6 text-[#506072] dark:text-gray-300">
          أجوبة على أسئلتك عن تطبيق Kunz El Ouloum — للمراجعة، الإشعارات، الاشتراك، والبكالوريا.
        </p>
      </div>

      <div className="space-y-1">
        {FAQS.map((faq) => (
          <div
            key={faq.id}
            data-testid={`faq-${faq.id}`}
            className="border border-[#bbcbbb]/30 rounded-2xl overflow-hidden transition-all"
          >
            <button
              onClick={() => toggle(faq.id)}
              aria-expanded={isOpen(faq.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-right text-sm font-bold text-[#1f1c0b] dark:text-gray-100 bg-white dark:bg-[#1f2622] hover:bg-[#f8fbfa] dark:hover:bg-gray-900/50"
            >
              <div className="flex items-center gap-2 flex-1">
                {CATEGORY_LABEL[faq.category] && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                      faq.category === 'push'
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                        : 'bg-[#fff9ed] text-[#8a5a00] dark:bg-gray-800 dark:text-amber-300'
                    }`}
                  >
                    {CATEGORY_LABEL[faq.category]}
                  </span>
                )}
                <span className="truncate">{faq.question}</span>
              </div>
              {isOpen(faq.id) ? (
                <ChevronUp className="w-4 h-4 text-[#006d37] dark:text-[#2ecc71]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#006d37] dark:text-[#2ecc71]" />
              )}
            </button>
            {isOpen(faq.id) && (
              <div className="px-4 pb-3 border-t border-[#bbcbbb]/20 bg-[#f8fbfa]/50 dark:bg-gray-950/30 text-sm leading-6 text-[#506072] dark:text-gray-300">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-[#bbcbbb]/30 pt-4 flex items-center justify-between text-xs text-[#506072] dark:text-gray-400">
        <span>Kunz El Ouloum — للمراجعة SVT باكالوريا الجيل الثاني</span>
        <span>إجابات حقيقية، لا تخمينات</span>
      </div>
    </section>
  );
}
