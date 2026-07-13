import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Layers, Target, ChevronRight, ArrowRight, ChevronLeft } from 'lucide-react';
import { KNOWLEDGE_CARDS } from '../knowledgeCards';
import { BOOK_TUTOR_QA } from '../bookTutorQA';
import { INITIAL_UNITS } from '../data';
import { Unit } from '../types';
import { DOMAIN_INFO } from './LessonsView';

const AccordionCard: React.FC<{
  id: string;
  headerNode: React.ReactNode;
  badge?: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}> = ({ headerNode, badge, icon, color, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1a201c] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
    >
      <div
        className="p-4 md:p-5 cursor-pointer flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl text-white shadow-sm shrink-0" style={{ background: color }}>
            {icon}
          </div>
          <div className="min-w-0">
            <div className="text-base md:text-lg font-black text-gray-900 dark:text-white truncate">{headerNode}</div>
            {badge && <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">{badge}</span>}
          </div>
        </div>
        <div className={`transition-transform duration-300 shrink-0 ${open ? 'rotate-180' : ''}`}>
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28 }}
        className="overflow-hidden"
      >
        <div className="p-4 md:p-5 pt-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <span className="inline-block text-[11px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800">
      {children}
    </span>
  );
};

// Résumé synthétique de chaque domaine (affiché en dernière position dans la vue du domaine).
const DOMAIN_SUMMARIES: Record<string, string> = {
  'التخصص الوظيفي للبروتينات': `🧬 المجال الأول: التخصص الوظيفي للبروتينات
1. تعبير المورثة وتركيب البروتين
يتم التعبير الوراثي في خلايا حقيقيات النواة عبر مرحلتين متكاملتين:
	الاستنساخ (في النواة): يقوم إنزيم ARN بوليمراز بفك روابط الـ ADN وقراءة السلسلة المستنسخة لتركيب جزيء ARNm (الرسول). يخضع هذا الأخير لعملية نضج (حذف الإنترونات وربط الإكسونات) قبل خروجه للهيولى.
	الترجمة (في الهيولى): يتشكل معقد متعدد الريبوزوم (البوليزوم) لقراءة شفرات الـ ARNm (كل 3 نيوكليوتيدات تمثل رامزة تشفر لحمض أميني واحد). تتدخل جزيئات الـ ARNt بعد تنشيط الأحماض الأمينية لربطها بسلاسل ببتيدية متطاولة.
2. البنية الفراغية والنشاط الإنزيمي
	مستويات البنية: يتطوى البروتين من بنية أولية (تسلسل خطي) إلى ثانوية (α أو β) ثم ثالثية أو رابعية، وتستقر بفضل روابط كيميائية (هيدروجينية، شاردية، كارهة للماء، وجسور ثنائية الكبريت) تنشأ بين جذور الأحماض الأمينية R.
	النشاط الإنزيمي: يمتلك الإنزيم موقعاً فعالاً يتكامل بنيوياً مع مادة التفاعل (تكامل محفز). يتأثر النشاط بشدة بالحرارة والـ pH لأنها تغير الشحن الكهروكيميائية للأحماض الأمينية في الموقع الفعال أو تخرب بنية الإنزيم (التمسخ).
3. المناعة والاتصال العصبي
	الهوية البيولوجية (الذات): تتحدد بروتينات الغشاء الهيولي مثل معقد التوافق النسيجي الكبير (CMH أو HLA) ومحددات الزمر الدموية (ABO و Rh).
	الرد المناعي: يتضمن استجابة خلطية (تفرز فيها الخلايا البلازمية LBp أجساماً مضادة نوعية تشكل معقدات مناعية)، واستجابة خلوية (تخرب فيها الخلايا التائية القاتلة LTC الخلايا المصابة بالبرفورين). تنسق الخلايا LT_4 العمليتين عبر إفراز الإنترلوكينات.
	الاتصال العصبي: تحافظ مضخة Na^+/K^+ وقنوات الميز على كمون الراحة. عند التنبيه، تفتح القنوات الفولطية لتوليد كمون العمل (Na^+ للداخل ثم K^+ للخارج). في المشبك، يتسبب دخول Ca^(2+) في تحرير المبلغ الكيميائي (مثل الأستيل كولين) الذي يفتح القنوات المبوبة كيميائياً بعد المشبكية.`,

  'التحولات الطاقوية': `☀️ المجال الثاني: آليات تحويل الطاقة على مستوى الخلية
1. التركيب الضوئي (تحويل الطاقة الضوئية إلى كيميائية كامنة)
يتم في الصانعة الخضراء عبر مرحلتين:
	المرحلة الكيموضوئية (في التيلاكويد): يمتص اليخضور الضوء، يتهيج مركز التفاعل وتنتقل الإلكترونات في السلسلة التركيبية الضوئية. يتم تحلل الماء ضوئياً وينطلق O_2. يتشكل تدرج بروتوني يمر عبر الكرات المذنبة لتركيب الـ ATP وإرجاع المستقبل النهائي إلى NADPH,H^+.
	المرحلة الكيموحيوية (في الحشوة): يتم تثبيت الـ CO_2 على جزيء الـ RuDP بواسطة إنزيم الريبيسكو في حلقة كالفن، وتُستغل نواتج المرحلة السابقة (ATP و NADPH,H^+) لإرجاع المركبات وتركيب المادة العضوية (الغلوكوز).
2. التنفس والتخمر (تحويل الطاقة الكيميائية الكامنة إلى قابلة للاستعمال ATP)
	التحلل السكري (في الهيولى): مرحلة مشتركة يتم فيها هدم الغلوكوز إلى جزيئتين من حمض البيروفيك مع إنتاج 2 ATP و 2 (NADH,H^+ ).
	التنفس الخلوي (هدم كلي في المتقدرة): يدخل حمض البيروفيك للمادة الأساسية في المتقدرة ويتأكسد عبر حلقة كريبس منتجاً CO_2 ونواقل مرجعة. تتأكسد هذه النواقل في السلسلة التنفسية (على مستوى الأعراف) وتنتقل الإلكترونات إلى الأكسجين O_2 (المستقبل النهائي) ليتحول إلى H_2 O، ويتدفق الهيدروجين عبر الكرات المذنبة لإنتاج حصيلة طاقوية هائلة تقدر بـ 38 ATP.
	التخمر (هدم جزئي في غياب O_2): يبقى حمض البيروفيك في الهيولى ليتحول إلى كحول (تخمر كحولي) أو حمض اللبن (تخمر لبني) بحصيلة طاقوية ضئيلة جداً تقتصر على 2 ATP.`,

  'التكتونية العامة': `🌍 المجال الثالث: التكتونية العامة (الجيولوجيا)
1. بنية الأرض وحركية الصفائح
	البنية الداخلية للأرض: تم تحديدها بالدراسة السيزمية وموجات الانتشار. تفصل بين الطبقات انقطاعات (موهو، غوتنبرغ، ليمان). يتكون الغلاف الصخري (الّليتوسفير) الصلب من القشرة والجزء العلوي للرداء، ويتحرك فوق الغلاف المائع (الأستيثوسفير).
	البناء والتوسع (الظهرات): تلتقي تيارات الحمل الحراري الصاعدة عند الظهرات المحيطية، مما يؤدي للانصهار الجزئي لبيريدوتيت الأستيثوسفير وصعود الماغما البازلتية التي تتصلب لتشكل قشرة محيطية جديدة (تباعد).
2. الغوص، التصادم، والتحول
	الدمار والاختفاء (الغوص): تغوص الصفيحة المحيطية الأكثر كثافة تحت الصفيحة القارية الأقل كثافة، وتتميز بمخطط "بينيوف" للزلازل المائلة، وبركانية انفجارية عنيفة ناتجة عن انصهار البيريدوتيت المميه.
	التصادم وتشكل الجبال: بعد اختفاء المحيط بالكامل، تصطدم الكتل القارية مما يؤدي إلى تضخم القشرة وتداخلها. المؤشرات الجيولوجية للتصادم هي وجود الأوفوليت (بقايا المحيط القديم)، الرسوبيات البحرية، والتشوهات العنيفة كالفوالق المعكوسة والطيات والشحن.
	التحول: تحت تأثير الضغط والحرارة المرتفعين في مناطق الغوص والتصادم، تتغير البنية المعدنية والنسيجية للصخور الأصلية دون انصهار، مما يعطي سحنات تحولية مميزة (مثل الشست الأخضر، الأزرق، والإيكلوجيت).`,
};

export default function SvtConceptsView() {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  // Group SVT concept items (knowledge cards + book tutor QA) by their unit.
  const itemsByUnit = useMemo(() => {
    type Item = any;
    const m = new Map<number, Item[]>();
    for (const c of KNOWLEDGE_CARDS) {
      const uid = c.unitId;
      if (!m.has(uid)) m.set(uid, []);
      m.get(uid)!.push({ ...c, _t: 'card' });
    }
    for (const b of BOOK_TUTOR_QA) {
      const uid = b.unitId;
      if (!m.has(uid)) m.set(uid, []);
      m.get(uid)!.push({ ...b, _t: 'book' });
    }
    return m;
  }, []);

  // Only keep units that actually contain SVT concepts.
  const unitsWithConcepts = useMemo(
    () => INITIAL_UNITS.filter((unit) => itemsByUnit.has(unit.id)),
    [itemsByUnit]
  );

  // Build the 3 domains (preserving natural order) → units.
  const domains = useMemo(() => {
    const ordered: string[] = [];
    const byDomain = new Map<string, Unit[]>();
    for (const unit of unitsWithConcepts) {
      if (!byDomain.has(unit.domain)) {
        byDomain.set(unit.domain, []);
        ordered.push(unit.domain);
      }
      byDomain.get(unit.domain)!.push(unit);
    }
    return ordered.map((name) => ({ name, units: byDomain.get(name)! }));
  }, [unitsWithConcepts]);

  const domainUnits = useMemo(
    () => (selectedDomain ? unitsWithConcepts.filter((u) => u.domain === selectedDomain) : []),
    [selectedDomain, unitsWithConcepts]
  );

  const selectedUnit = unitsWithConcepts.find((u) => u.id === selectedUnitId) || null;
  const unitItems = selectedUnitId ? itemsByUnit.get(selectedUnitId) ?? [] : [];

  const goToDomain = (domain: string) => {
    setSelectedDomain(domain);
    setSelectedUnitId(null);
  };

  const goToUnit = (unitId: number) => setSelectedUnitId(unitId);

  const backToDomains = () => {
    setSelectedDomain(null);
    setSelectedUnitId(null);
  };

  const backToUnits = () => setSelectedUnitId(null);

  return (
    <div className="space-y-6 pb-24 font-sans" dir="rtl">
      <section className="bg-gradient-to-br from-[#0284c7] to-[#0369a1] text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute left-0 top-0 w-40 h-40 bg-sky-400/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
            <BookOpen className="w-7 h-7 text-[#fed65b]" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black">مكتبة المصطلحات SVT — Concepts SVT</h2>
            <p className="text-sm text-white/80 mt-2 leading-7 max-w-2xl">
              مصطلحات ومفاهيم علمية، منظمة حسب المجالات والوحدات (الفصول).
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-2 flex-wrap text-sm">
        <button
          onClick={backToDomains}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            selectedDomain ? 'text-[#0284c7] hover:bg-[#0284c7]/15' : 'text-[#0284c7] opacity-70'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>المجالات</span>
        </button>
        {selectedDomain && (
          <>
            <ChevronRight className="w-4 h-4 opacity-40" />
            <button
              onClick={backToUnits}
              disabled={!selectedUnitId}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedUnitId
                  ? 'text-[#0284c7] hover:bg-[#0284c7]/15'
                  : 'text-[#1f1c0b] dark:text-gray-100 opacity-70'
              }`}
            >
              {selectedDomain}
            </button>
          </>
        )}
        {selectedUnit && (
          <>
            <ChevronRight className="w-4 h-4 opacity-40" />
            <span className="px-3 py-1.5 rounded-xl font-bold text-[#1f1c0b] dark:text-gray-100 opacity-90">{selectedUnit.title}</span>
          </>
        )}
      </nav>

      {/* LEVEL 1 — 3 domains (like the 3 DOMAINES) */}
      {!selectedDomain && (
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {domains.map((domain, idx) => {
            const info = DOMAIN_INFO[domain.name] ?? { fr: '', icon: Layers, color: '#0284c7', light: '#e0f2fe', dark: '#0369a1' };
            const Icon = info.icon;
            const unitCount = domain.units.length;
            const conceptCount = domain.units.reduce((acc, u) => acc + (itemsByUnit.get(u.id)?.length ?? 0), 0);
            return (
              <motion.button
                key={domain.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                onClick={() => goToDomain(domain.name)}
                className="group text-right rounded-3xl p-5 shadow-sm border border-[#e2dabf]/60 dark:border-[#0284c7]/10 bg-white dark:bg-[#141916] hover:shadow-md transition-all cursor-pointer flex flex-col gap-4"
                style={{ borderTop: `4px solid ${info.color}` }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: info.light }}
                  >
                    <Icon className="w-9 h-9" style={{ color: info.color }} />
                  </div>
                  <span
                    className="text-[11px] font-black px-3 py-1 rounded-full"
                    style={{ background: info.color, color: '#fff' }}
                  >
                    المجال {idx + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1f1c0b] dark:text-gray-100 leading-snug">{domain.name}</h3>
                  <p className="text-xs text-[#506072] dark:text-gray-400 mt-1">{info.fr}</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold text-[#504441] dark:text-gray-300">
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" style={{ color: info.color }} />
                    {unitCount} وحدة
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" style={{ color: info.color }} />
                    {conceptCount} مفهوم
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-extrabold mt-auto" style={{ color: info.color }}>
                  <span>استكشف المفاهيم</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </section>
      )}

      {/* LEVEL 2 — Units (chapters) of the selected domain, in order */}
      {selectedDomain && !selectedUnitId && (
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {domainUnits.map((unit, idx) => {
            const info = DOMAIN_INFO[selectedDomain] ?? { fr: '', icon: Layers, color: '#0284c7', light: '#e0f2fe', dark: '#0369a1' };
            const conceptCount = itemsByUnit.get(unit.id)?.length ?? 0;
            return (
              <motion.button
                key={unit.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => goToUnit(unit.id)}
                className="group text-right rounded-3xl p-5 shadow-sm border border-[#e2dabf]/60 dark:border-[#0284c7]/10 bg-white dark:bg-[#141916] hover:shadow-md transition-all cursor-pointer flex flex-col gap-3"
                style={{ borderTop: `4px solid ${info.color}` }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[11px] font-black px-3 py-1 rounded-full"
                    style={{ background: info.light, color: info.color }}
                  >
                    الوحدة {idx + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1f1c0b] dark:text-gray-100 leading-snug">{unit.title}</h3>
                  <p className="text-xs text-[#506072] dark:text-gray-400 mt-1 leading-6">{unit.description}</p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#504441] dark:text-gray-300">
                    <BookOpen className="w-3.5 h-3.5" style={{ color: info.color }} />
                    {conceptCount} مفهوم
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-extrabold mt-auto" style={{ color: info.color }}>
                  <span>عرض المفاهيم</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            );
          })}

          {/* Résumé du domaine — en dernière position */}
          {DOMAIN_SUMMARIES[selectedDomain] && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: domainUnits.length * 0.05 + 0.1 }}
              className="sm:col-span-2 lg:col-span-3 rounded-3xl p-5 shadow-sm border border-[#e2dabf]/60 dark:border-[#0284c7]/20 bg-white dark:bg-[#141916]"
              style={{ borderTop: `4px solid ${DOMAIN_INFO[selectedDomain]?.color ?? '#0284c7'}` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ background: DOMAIN_INFO[selectedDomain]?.color ?? '#0284c7' }} />
                <h3 className="text-base font-black text-[#1f1c0b] dark:text-gray-100">ملخص المجال</h3>
              </div>
              <p className="text-sm text-[#504441] dark:text-gray-300 font-medium leading-8 whitespace-pre-line">
                {DOMAIN_SUMMARIES[selectedDomain]}
              </p>
            </motion.div>
          )}
        </section>
      )}

      {/* LEVEL 3 — Concepts of the selected unit */}
      {selectedUnitId && (
        <div className="space-y-3">
          {unitItems.map((it: any) => {
            const info = selectedUnit ? DOMAIN_INFO[selectedUnit.domain] : null;
            const color = info?.color ?? '#006d37';
            if (it._t === 'book') {
              return (
                <AccordionCard
                  key={it.id}
                  id={it.id}
                  icon={<BookOpen className="w-5 h-5" />}
                  color="#0ea5e9"
                  badge={it.topic}
                  headerNode={it.question}
                >
                  <div className="space-y-3">
                    <p className="text-gray-800 dark:text-gray-200 font-medium leading-8 whitespace-pre-line">{it.answer}</p>
                    {it.followUp && (
                      <p className="text-xs font-bold text-sky-700 dark:text-sky-300">↪ سؤال متابعة: {it.followUp}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {it.keywords.map((k: string, ki: number) => (
                        <Chip key={ki}>{k}</Chip>
                      ))}
                    </div>
                  </div>
                </AccordionCard>
              );
            }
            return (
              <AccordionCard
                key={it.id}
                id={it.id}
                icon={<Layers className="w-5 h-5" />}
                color={color}
                headerNode={it.title}
              >
                <div className="space-y-3">
                  <p className="text-gray-800 dark:text-gray-200 font-medium leading-8 whitespace-pre-line">{it.shortAnswer}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {it.keywords.map((k: string, ki: number) => (
                      <Chip key={ki}>{k}</Chip>
                    ))}
                  </div>
                  {it.relatedQuestions?.length > 0 && (
                    <div className="pt-1">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">أسئلة ذات صلة:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {it.relatedQuestions.map((rq: string, ri: number) => (
                          <span key={ri} className="text-[11px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                            {rq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
